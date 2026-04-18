package com.example.backend.testing.imports.dto;

import com.example.backend.model.Patient;
import com.example.backend.model.TriageResult;

/**
 * Compact triage outcome for dataset import responses (mirrors stored {@link TriageResult} on the patient).
 */
public record DatasetTriageSummary(
        long patientId,
        String risk,
        String priority,
        String concern,
        String reasoning,
        String confidence,
        String assignedDoctor,
        String recommendedAction,
        String suggestedSpecialty
) {
    public static DatasetTriageSummary fromPatient(Patient patient) {
        if (patient.getId() == null) {
            return null;
        }
        TriageResult t = patient.getTriageResult();
        if (t == null) {
            return null;
        }
        return new DatasetTriageSummary(
                patient.getId(),
                t.getRisk(),
                t.getPriority(),
                t.getConcern(),
                t.getReasoning(),
                t.getConfidence(),
                t.getAssignedDoctor(),
                t.getRecommendedAction(),
                t.getSuggestedSpecialty()
        );
    }
}
