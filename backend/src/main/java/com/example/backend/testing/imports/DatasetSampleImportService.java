package com.example.backend.testing.imports;

import com.example.backend.model.Patient;
import com.example.backend.service.PatientService;
import com.example.backend.testing.dataset.DatasetPatientMapper;
import com.example.backend.testing.dataset.DatasetRow;
import com.example.backend.testing.dataset.MedicalDatasetCsvReader;
import com.example.backend.testing.imports.dto.DatasetImportSampleResponse;
import com.example.backend.testing.imports.dto.DatasetTriageSummary;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Orchestrates CSV dataset sample import using {@link PatientService} (same create + triage flow as the REST API).
 */
@Service
@ConditionalOnBean(MedicalDatasetCsvReader.class)
public class DatasetSampleImportService {

    private static final int MAX_LIMIT = 100;

    private final MedicalDatasetCsvReader csvReader;
    private final PatientService patientService;

    public DatasetSampleImportService(MedicalDatasetCsvReader csvReader, PatientService patientService) {
        this.csvReader = csvReader;
        this.patientService = patientService;
    }

    /** Location label for error responses (filesystem path or {@code classpath:...}). */
    public String describeDatasetSource() {
        return csvReader.describeSource();
    }

    public DatasetImportSampleResponse importSample(int limit, int offset, boolean runTriage) throws IOException {
        int safeOffset = Math.max(0, offset);
        int safeLimit = Math.min(Math.max(0, limit), MAX_LIMIT);

        List<DatasetRow> all = csvReader.readAll();
        int total = all.size();
        if (safeLimit == 0 || safeOffset >= total) {
            return new DatasetImportSampleResponse(0, List.of(), null);
        }

        int end = Math.min(safeOffset + safeLimit, total);
        List<Patient> patients = new ArrayList<>(end - safeOffset);
        List<DatasetTriageSummary> summaries = runTriage ? new ArrayList<>(end - safeOffset) : null;

        for (int i = safeOffset; i < end; i++) {
            DatasetRow row = all.get(i);
            Patient intake = DatasetPatientMapper.toPatient(row, i);
            Patient saved = patientService.createPatient(intake);
            if (runTriage) {
                saved = patientService.runTriage(saved.getId()).orElse(saved);
                summaries.add(DatasetTriageSummary.fromPatient(saved));
            }
            patients.add(saved);
        }

        return new DatasetImportSampleResponse(patients.size(), patients, summaries);
    }
}
