package com.example.backend.service;

import com.example.backend.model.Hospital;
import com.example.backend.model.Patient;
import com.example.backend.model.TriageResult;
import com.example.backend.repository.DoctorRepository;
import com.example.backend.repository.PatientRepository;
import com.example.backend.web.dto.PatientIntakeMapper;
import com.example.backend.web.dto.PatientIntakeRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

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
        return Optional.of(patientRepository.save(patient));
    }

    private static String formatPatientCode(Long id) {
        long safeId = id == null ? 0L : id;
        return String.format("PT-%04d", safeId);
    }
}
