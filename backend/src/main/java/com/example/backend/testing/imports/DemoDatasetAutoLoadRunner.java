package com.example.backend.testing.imports;

import com.example.backend.service.PatientService;
import com.example.backend.testing.config.TestingDatasetImportProperties;
import com.example.backend.testing.imports.dto.DatasetImportSampleResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Loads a small dataset sample on startup for demos when explicitly enabled.
 */
@Component
@ConditionalOnBean(DatasetSampleImportService.class)
public class DemoDatasetAutoLoadRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDatasetAutoLoadRunner.class);

    private final PatientService patientService;
    private final DatasetSampleImportService datasetSampleImportService;
    private final TestingDatasetImportProperties testingDatasetImportProperties;

    public DemoDatasetAutoLoadRunner(
            PatientService patientService,
            DatasetSampleImportService datasetSampleImportService,
            TestingDatasetImportProperties testingDatasetImportProperties
    ) {
        this.patientService = patientService;
        this.datasetSampleImportService = datasetSampleImportService;
        this.testingDatasetImportProperties = testingDatasetImportProperties;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("Dataset auto-load runner started");
        log.info("Dataset auto-load config: autoLoad={}, importEnabled={}, csvPath={}",
                testingDatasetImportProperties.isAutoLoad(),
                testingDatasetImportProperties.isImportEnabled(),
                testingDatasetImportProperties.getCsvPath());
        if (!testingDatasetImportProperties.isAutoLoad()) {
            log.info("Dataset auto-load skipped: autoLoad=false");
            return;
        }
        List<com.example.backend.model.Patient> existingPatients = patientService.listPatients();
        boolean patientsAlreadyExist = !existingPatients.isEmpty();
        long existingDemoPatients = existingPatients.stream().filter(com.example.backend.model.Patient::isImportedFromDataset).count();
        long existingManualPatients = existingPatients.size() - existingDemoPatients;
        log.info("Dataset auto-load startup check: patientsAlreadyExist={}", patientsAlreadyExist);
        log.info("Dataset auto-load startup check: existingDemoPatients={}, existingManualPatients={}",
                existingDemoPatients, existingManualPatients);
        log.info("Dataset auto-load startup check: datasetSampleImportServicePresent={}", datasetSampleImportService != null);
        if (existingDemoPatients > 0) {
            log.info("Dataset auto-load path: skip re-import because demo patients already exist");
            log.info("Dataset auto-load importRan=false");
            return;
        }

        try {
            DatasetImportSampleResponse result = datasetSampleImportService.importSample(10, 0, true);
            log.info("Dataset auto-load importRan=true");
            if (result.importedCount() > 0) {
                log.info("Dataset auto-loaded: {} patients", result.importedCount());
            } else {
                log.info("Dataset auto-load completed: imported 0 patients");
            }
        } catch (Exception e) {
            // Keep startup resilient when dataset file/path is absent or invalid.
            log.info("Dataset auto-load importRan=false");
            log.warn("Demo dataset auto-load skipped: {}", e.getMessage());
        }
    }
}
