package com.example.backend.web.dto;

/**
 * Request body for creating or updating patient intake details (no id or patientCode).
 */
public record PatientIntakeRequest(
        String fullName,
        int age,
        String sex,
        String roomNumber,
        int heartRate,
        double temperature,
        int wbc,
        String bloodPressure,
        double oxygenSaturation,
        String chiefComplaint,
        String symptomDuration,
        int painLevel,
        boolean fever,
        boolean shortnessOfBreath,
        boolean chestPain,
        String arrivalTime,
        String triageNurseName,
        String departmentNeeded,
        String priorityNote
) {
}
