package com.example.backend.testing.imports.dto;

/**
 * Request body for {@code POST /testing/import-dataset-sample}.
 */
public record DatasetImportSampleRequest(
        Integer limit,
        Integer offset,
        Boolean runTriage
) {
}
