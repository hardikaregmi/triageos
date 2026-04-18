package com.example.backend.service;

import com.example.backend.model.Hospital;
import com.example.backend.model.Patient;
import com.example.backend.model.TriageResult;
import com.example.backend.repository.DoctorRepository;
import com.example.backend.repository.PatientRepository;
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

    public Patient createPatient(Patient intake) {
        intake.setId(null);
        intake.setPatientIdentifier(null);
        intake.setTriageResult(null);
        if (intake.getHospitalId() == null) {
            intake.setHospitalId(Hospital.DEFAULT_ID);
        }
        Patient saved = patientRepository.save(intake);
        if (saved.getPatientIdentifier() == null || saved.getPatientIdentifier().isBlank()) {
            saved.setPatientIdentifier(formatPatientIdentifier(saved.getId()));
            saved = patientRepository.save(saved);
        }
        return saved;
    }

    public boolean deletePatient(long id) {
        return patientRepository.deleteById(id);
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

    private static String formatPatientIdentifier(Long id) {
        long safeId = id == null ? 0L : id;
        return String.format("PT-%04d", safeId);
    }
}
