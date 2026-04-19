package com.example.backend.service;

import com.example.backend.model.Hospital;
import com.example.backend.model.Patient;
import com.example.backend.model.TriageResult;
import com.example.backend.repository.DoctorRepository;
import com.example.backend.repository.PatientRepository;
import com.example.backend.web.dto.PatientCheckRequest;
import com.example.backend.web.dto.PatientIntakeMapper;
import com.example.backend.web.dto.PatientIntakeRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientService.class);

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final TriageService triageService;
    private final AiTriageService aiTriageService;

    public PatientService(
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            TriageService triageService,
            AiTriageService aiTriageService) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.triageService = triageService;
        this.aiTriageService = aiTriageService;
    }

    public List<Patient> listPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatient(long id) {
        return patientRepository.findById(id);
    }

    public Patient createPatient(PatientIntakeRequest intake) {
        Patient p = PatientIntakeMapper.toNewPatient(intake);
        return saveNewPatient(p);
    }

    /**
     * Persists a patient built elsewhere (e.g. CSV dataset mapper) including flags like {@code importedFromDataset}.
     */
    public Patient createPatientFromPreparedEntity(Patient prepared) {
        return saveNewPatient(prepared);
    }

    private Patient saveNewPatient(Patient p) {
        p.setId(null);
        p.setPatientCode(null);
        p.setTriageResult(null);
        if (p.getHospitalId() == null) {
            p.setHospitalId(Hospital.DEFAULT_ID);
        }
        Patient saved = patientRepository.save(p);
        if (saved.getPatientCode() == null || saved.getPatientCode().isBlank()) {
            saved.setPatientCode(formatPatientCode(saved.getId()));
            saved = patientRepository.save(saved);
        }
        return saved;
    }

    /**
     * Updates intake fields only; id and patientCode are never changed from the request.
     */
    public Optional<Patient> updatePatient(long id, PatientIntakeRequest intake) {
        return patientRepository.findById(id).map(existing -> {
            PatientIntakeMapper.apply(existing, intake);
            return patientRepository.save(existing);
        });
    }

    public boolean deletePatient(long id) {
        if (!patientRepository.existsById(id)) {
            return false;
        }
        patientRepository.deleteById(id);
        return true;
    }

    public Optional<Patient> runTriage(long id) {
        Optional<Patient> found = patientRepository.findById(id);
        if (found.isEmpty()) {
            return Optional.empty();
        }
        Patient patient = found.get();
        TriageResult result = aiTriageService.assess(patient);
        if (result == null) {
            result = triageService.triagePatient(patient, doctorRepository.findAll());
        }
        patient.setTriageResult(result);
        triageService.applyMonitoringSchedule(patient, result);
        return Optional.of(patientRepository.save(patient));
    }

    /**
     * Nurse check-in: records visit, clears {@code needsCheck}, schedules next check, optional notes.
     */
    @Transactional
    public Optional<Patient> checkInPatient(long id, PatientCheckRequest request) {
        return patientRepository.findById(id).map(patient -> {
            try {
                LocalDateTime now = LocalDateTime.now();
                patient.setLastCheckedAt(now);
                patient.setNeedsCheck(false);
                if (request.nurseId() != null && !request.nurseId().isBlank()) {
                    patient.setAssignedNurseId(request.nurseId().trim());
                }
                int interval = triageService.determineCheckIntervalMinutes(patient.getTriageResult());
                patient.setCheckIntervalMinutes(interval);
                patient.setNextCheckAt(now.plusMinutes(interval));
                if (request.notes() != null && !request.notes().isBlank()) {
                    patient.setCheckNotes(request.notes().trim());
                }
                patient.setDoctorAlertRequired(false);
                Patient saved = patientRepository.save(patient);
                log.info(
                        "checkInPatient: id={} intervalMin={} lastCheckedAt={} nextCheckAt={}",
                        saved.getId(),
                        interval,
                        saved.getLastCheckedAt(),
                        saved.getNextCheckAt());
                return saved;
            } catch (RuntimeException e) {
                log.error("checkInPatient failed for id={}: {}", id, e.toString(), e);
                throw e;
            }
        });
    }

    /**
     * Marks {@code needsCheck} when the next check time is due (called by scheduler).
     */
    @Transactional
    public void refreshDuePatientChecks() {
        LocalDateTime now = LocalDateTime.now();
        for (Patient p : patientRepository.findAll()) {
            if (p.getNextCheckAt() == null) {
                continue;
            }
            if (!now.isBefore(p.getNextCheckAt())) {
                if (!p.isNeedsCheck()) {
                    p.setNeedsCheck(true);
                    patientRepository.save(p);
                }
            }
        }
    }

    /**
     * After dataset CSV triage, assigns a realistic mix of monitoring states for demos: about 2–4 rows need nurse
     * follow-up (overdue or never checked), the rest already checked with a future next check. Does not alter
     * non-imported patients.
     */
    public Patient applyImportedDemoMonitoringMix(Patient patient, int indexInBatch, int batchSize) {
        if (!patient.isImportedFromDataset() || patient.getTriageResult() == null) {
            return patient;
        }
        LocalDateTime now = LocalDateTime.now();
        int interval = Math.max(30, patient.getCheckIntervalMinutes() != null ? patient.getCheckIntervalMinutes() : 30);

        boolean needsNurseCheck =
                indexInBatch == 0
                        || (batchSize >= 4 && indexInBatch == 3)
                        || (batchSize >= 7 && indexInBatch == 6)
                        || (batchSize >= 10 && indexInBatch == 9);

        if (needsNurseCheck) {
            patient.setNeedsCheck(true);
            patient.setLastCheckedAt(
                    (indexInBatch == 6 || indexInBatch == 9) ? now.minusMinutes(40 + indexInBatch) : null);
            patient.setNextCheckAt(now.minusMinutes(5L + (indexInBatch % 12)));
        } else {
            patient.setNeedsCheck(false);
            patient.setLastCheckedAt(now.minusMinutes(20 + indexInBatch * 3));
            patient.setNextCheckAt(now.plusMinutes(interval));
        }
        return patientRepository.save(patient);
    }

    /**
     * Ensures at least one HIGH-risk imported patient appears overdue for nurse check-in when the batch mix would
     * otherwise hide high acuity (helps consistent hackathon demos).
     */
    public void ensureDemoHasOverdueHighRiskPatient(List<Patient> batch) {
        if (batch == null || batch.isEmpty()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        boolean already = batch.stream().anyMatch(PatientService::isHighRiskOverdueForDemo);
        if (already) {
            return;
        }
        Optional<Patient> firstHigh = batch.stream()
                .filter(p -> p.getTriageResult() != null && "HIGH".equals(p.getTriageResult().getRisk()))
                .findFirst();
        if (firstHigh.isEmpty()) {
            return;
        }
        Patient p = firstHigh.get();
        p.setNeedsCheck(true);
        p.setLastCheckedAt(now.minusMinutes(30));
        p.setNextCheckAt(now.minusMinutes(10));
        p.setDoctorAlertRequired(true);
        patientRepository.save(p);
    }

    /**
     * Demo-only reset: restores a realistic monitoring mix without deleting any patient or altering triage data.
     * Returns counts: {@code [resetToNeedsCheck, keptChecked, untouched]}.
     */
    @Transactional
    public int[] resetDemoChecks() {
        List<Patient> all = patientRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        List<Patient> triaged = all.stream()
                .filter(p -> p.getTriageResult() != null)
                .collect(java.util.stream.Collectors.toList());
        int untouched = all.size() - triaged.size();
        if (triaged.isEmpty()) {
            return new int[] {0, 0, untouched};
        }

        Patient highRiskOverdue = triaged.stream()
                .filter(p -> "HIGH".equals(p.getTriageResult().getRisk()))
                .findFirst()
                .orElse(null);

        java.util.LinkedHashSet<Long> needsCheckIds = new java.util.LinkedHashSet<>();
        if (highRiskOverdue != null) {
            needsCheckIds.add(highRiskOverdue.getId());
        }
        // Aim for 3 needs-check rows by default (clamped to 2..4 by triaged count and demo size).
        int target = Math.min(4, Math.max(2, Math.min(3, triaged.size())));
        for (int i = 0; i < triaged.size() && needsCheckIds.size() < target; i += 2) {
            needsCheckIds.add(triaged.get(i).getId());
        }
        for (int i = 1; i < triaged.size() && needsCheckIds.size() < target; i += 2) {
            needsCheckIds.add(triaged.get(i).getId());
        }

        int resetToNeedsCheck = 0;
        int keptChecked = 0;
        int idx = 0;
        for (Patient p : triaged) {
            int interval = Math.max(
                    30,
                    p.getCheckIntervalMinutes() != null && p.getCheckIntervalMinutes() > 0
                            ? p.getCheckIntervalMinutes()
                            : triageService.determineCheckIntervalMinutes(p.getTriageResult()));
            p.setCheckIntervalMinutes(interval);

            if (needsCheckIds.contains(p.getId())) {
                p.setNeedsCheck(true);
                boolean isHighOverdue = highRiskOverdue != null && highRiskOverdue.getId().equals(p.getId());
                if (isHighOverdue) {
                    p.setLastCheckedAt(now.minusMinutes(40));
                    p.setNextCheckAt(now.minusMinutes(10));
                    p.setDoctorAlertRequired(true);
                } else if (idx % 2 == 0) {
                    p.setLastCheckedAt(null);
                    p.setNextCheckAt(now.minusMinutes(5L + (idx % 7)));
                } else {
                    p.setLastCheckedAt(now.minusMinutes(35L + (idx % 11)));
                    p.setNextCheckAt(now.minusMinutes(2L + (idx % 5)));
                }
                resetToNeedsCheck++;
            } else {
                p.setNeedsCheck(false);
                p.setLastCheckedAt(now.minusMinutes(15L + (idx % 12)));
                p.setNextCheckAt(now.plusMinutes(interval));
                p.setDoctorAlertRequired(false);
                keptChecked++;
            }
            patientRepository.save(p);
            idx++;
        }

        log.info(
                "resetDemoChecks: total={} triaged={} needsCheck={} keptChecked={} untouched={}",
                all.size(),
                triaged.size(),
                resetToNeedsCheck,
                keptChecked,
                untouched);
        return new int[] {resetToNeedsCheck, keptChecked, untouched};
    }

    private static boolean isHighRiskOverdueForDemo(Patient p) {
        if (p.getTriageResult() == null || !"HIGH".equals(p.getTriageResult().getRisk())) {
            return false;
        }
        if (!p.isNeedsCheck()) {
            return false;
        }
        LocalDateTime next = p.getNextCheckAt();
        return next == null || !next.isAfter(LocalDateTime.now());
    }

    private static String formatPatientCode(Long id) {
        long safeId = id == null ? 0L : id;
        return String.format("PT-%04d", safeId);
    }
}
