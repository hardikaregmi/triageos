package com.example.backend;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TriageService {
    private final List<Patient> patients = new ArrayList<>();
    private final List<Doctor> doctors = new ArrayList<>();
    private final AtomicLong patientIdGenerator = new AtomicLong(1);

    public TriageService() {
        // Seed doctors in memory.
        doctors.add(new Doctor(1, "Dr. Patel", "Internal Medicine", "available"));
        doctors.add(new Doctor(2, "Dr. Nguyen", "Emergency Medicine", "available"));
        doctors.add(new Doctor(3, "Dr. Smith", "General Practice", "busy"));
        doctors.add(new Doctor(4, "Dr. Carter", "Cardiology", "available"));
    }

    public synchronized List<Patient> getPatients() {
        return new ArrayList<>(patients);
    }

    public synchronized Patient addPatient(String name, int heartRate, double temperature, int wbc) {
        Patient patient = new Patient(
                patientIdGenerator.getAndIncrement(),
                name,
                heartRate,
                temperature,
                wbc
        );
        patients.add(patient);
        return patient;
    }

    public synchronized boolean deletePatient(long id) {
        return patients.removeIf(patient -> patient.getId() == id);
    }

    public synchronized List<Doctor> getDoctors() {
        return new ArrayList<>(doctors);
    }

    public synchronized DashboardSummary getDashboardSummary() {
        int highRiskPatients = (int) patients.stream()
                .filter(p -> "HIGH".equals(p.getRisk()))
                .count();

        int availableDoctors = (int) doctors.stream()
                .filter(d -> "available".equalsIgnoreCase(d.getStatus()))
                .count();

        return new DashboardSummary(patients.size(), highRiskPatients, availableDoctors);
    }

    public synchronized Patient triagePatient(long id) {
        Patient patient = patients.stream()
                .filter(p -> p.getId() == id)
                .findFirst()
                .orElse(null);

        if (patient == null) {
            return null;
        }

        TriageResult result = calculateResult(patient.getHeartRate(), patient.getTemperature(), patient.getWbc());
        String assignedDoctor = pickDoctorForMessage(result.message());

        patient.setRisk(result.risk());
        patient.setMessage(result.message());
        patient.setReasoning(result.reasoning());
        patient.setConfidence(result.confidence());
        patient.setAssignedDoctor(assignedDoctor);

        return patient;
    }

    private TriageResult calculateResult(int heartRate, double temperature, int wbc) {
        if (heartRate >= 120 && temperature >= 102 && wbc >= 15000) {
            return new TriageResult(
                    "HIGH",
                    "Severe infection risk",
                    "Very high heart rate, high fever, and elevated WBC suggest a severe infection pattern.",
                    "92%"
            );
        } else if (heartRate > 100 && temperature > 100 && wbc > 12000) {
            return new TriageResult(
                    "HIGH",
                    "Possible early sepsis risk",
                    "Elevated heart rate, fever, and high WBC may indicate an early infection pattern.",
                    "92%"
            );
        } else if (heartRate > 110 && temperature < 99) {
            return new TriageResult(
                    "HIGH",
                    "Cardiac stress risk",
                    "High heart rate without fever may indicate cardiovascular strain.",
                    "92%"
            );
        } else if (temperature > 102) {
            return new TriageResult(
                    "LOW",
                    "Fever detected",
                    "High temperature present but other vitals are not critical.",
                    "68%"
            );
        } else {
            return new TriageResult(
                    "LOW",
                    "No immediate high-risk signs detected",
                    "Current vital signs do not show a strong critical pattern.",
                    "68%"
            );
        }
    }

    private String pickDoctorForMessage(String message) {
        List<String> preferred;

        if ("Severe infection risk".equals(message) || "Possible early sepsis risk".equals(message)) {
            preferred = List.of("Dr. Nguyen", "Dr. Patel");
        } else if ("Cardiac stress risk".equals(message)) {
            preferred = List.of("Dr. Carter", "Dr. Patel");
        } else {
            preferred = List.of("Dr. Patel", "Dr. Smith");
        }

        Doctor preferredAvailable = doctors.stream()
                .filter(d -> preferred.contains(d.getName()))
                .filter(d -> "available".equalsIgnoreCase(d.getStatus()))
                .min(Comparator.comparingInt(d -> preferred.indexOf(d.getName())))
                .orElse(null);
        if (preferredAvailable != null) {
            return preferredAvailable.getName();
        }

        Doctor anyAvailable = doctors.stream()
                .filter(d -> "available".equalsIgnoreCase(d.getStatus()))
                .findFirst()
                .orElse(null);
        if (anyAvailable != null) {
            return anyAvailable.getName();
        }

        Doctor fallback = doctors.stream()
                .filter(d -> preferred.contains(d.getName()))
                .min(Comparator.comparingInt(d -> preferred.indexOf(d.getName())))
                .orElse(null);
        return fallback != null ? fallback.getName() : null;
    }

    public record DashboardSummary(int totalPatients, int highRiskPatients, int availableDoctors) {
    }

    private record TriageResult(String risk, String message, String reasoning, String confidence) {
    }
}
