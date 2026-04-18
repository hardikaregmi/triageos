package com.example.backend.service;

import com.example.backend.model.DashboardSummary;
import com.example.backend.model.Patient;
import com.example.backend.repository.DoctorRepository;
import com.example.backend.repository.PatientRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public DashboardService(PatientRepository patientRepository, DoctorRepository doctorRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public DashboardSummary getSummary() {
        var patients = patientRepository.findAll();
        int highRiskPatients = (int) patients.stream()
                .filter(this::isHighRisk)
                .count();

        int availableDoctors = (int) doctorRepository.findAll().stream()
                .filter(d -> "available".equalsIgnoreCase(d.getStatus()))
                .count();

        return new DashboardSummary(patients.size(), highRiskPatients, availableDoctors);
    }

    private boolean isHighRisk(Patient patient) {
        return patient.getTriageResult() != null && "HIGH".equals(patient.getTriageResult().getRisk());
    }
}
