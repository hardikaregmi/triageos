package com.example.backend.testing.dataset;

/**
 * One logical row from {@code Disease_symptom_and_patient_profile_dataset.csv} (excluding the header).
 */
public record DatasetRow(
        int rowIndex,
        String disease,
        String fever,
        String cough,
        String fatigue,
        String difficultyBreathing,
        int age,
        String gender,
        String bloodPressure,
        String cholesterol,
        String outcome
) {
}
