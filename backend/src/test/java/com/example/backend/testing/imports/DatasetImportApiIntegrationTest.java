package com.example.backend.testing.imports;

import com.example.backend.testing.imports.dto.DatasetImportSampleRequest;
import com.example.backend.testing.imports.dto.DatasetImportSampleResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Verifies the dataset import utility is wired as a normal Spring MVC + service flow (classpath fixture).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(
        properties = {
                "triageos.testing.dataset.import-enabled=true",
                "triageos.testing.dataset.csv-path=classpath:testing/datasets/minimal-dataset.csv"
        }
)
class DatasetImportApiIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void importSample_persistsPatientsWithoutTriageWhenRequested() {
        ResponseEntity<DatasetImportSampleResponse> res = restTemplate.postForEntity(
                "/testing/import-dataset-sample",
                new DatasetImportSampleRequest(2, 0, false),
                DatasetImportSampleResponse.class
        );

        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertNotNull(res.getBody());
        assertEquals(2, res.getBody().importedCount());
        assertEquals(2, res.getBody().patients().size());
        assertNull(res.getBody().triageSummaries());
    }
}
