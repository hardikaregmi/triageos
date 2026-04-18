package com.example.backend.testing.imports;

import com.example.backend.testing.imports.dto.DatasetImportSampleRequest;
import com.example.backend.testing.imports.dto.DatasetImportSampleResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

/**
 * HTTP surface for the dataset sample import utility (delegates to {@link DatasetSampleImportService}).
 */
@RestController
@RequestMapping("/testing")
@CrossOrigin(origins = "http://localhost:3000")
@ConditionalOnBean(DatasetSampleImportService.class)
public class DatasetImportApiController {

    private final DatasetSampleImportService datasetSampleImportService;

    public DatasetImportApiController(DatasetSampleImportService datasetSampleImportService) {
        this.datasetSampleImportService = datasetSampleImportService;
    }

    /**
     * Imports a slice of CSV rows as patients. Default import size is 5 rows; use {@code limit} to change.
     * When {@code runTriage} is true, triage is persisted on each patient and echoed in {@code triageSummaries}.
     */
    @PostMapping("/import-dataset-sample")
    public ResponseEntity<?> importDatasetSample(@RequestBody(required = false) DatasetImportSampleRequest request) {
        int limit = request != null && request.limit() != null ? request.limit() : 5;
        int offset = request != null && request.offset() != null ? request.offset() : 0;
        boolean runTriage = request == null || request.runTriage() == null || request.runTriage();
        try {
            DatasetImportSampleResponse body = datasetSampleImportService.importSample(limit, offset, runTriage);
            return ResponseEntity.ok(body);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Failed to read dataset CSV",
                            "detail", e.getMessage(),
                            "source", datasetSampleImportService.describeDatasetSource()
                    ));
        }
    }
}
