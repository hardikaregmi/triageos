package com.example.backend.testing.imports.dto;

import com.example.backend.model.Patient;

import java.util.List;

/**
 * Result of {@code POST /testing/import-dataset-sample}.
 */
public record DatasetImportSampleResponse(
        int importedCount,
        List<Patient> patients,
        List<DatasetTriageSummary> triageSummaries
) {
}
