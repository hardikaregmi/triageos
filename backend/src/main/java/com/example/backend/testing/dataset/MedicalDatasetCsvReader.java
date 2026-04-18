package com.example.backend.testing.dataset;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import com.example.backend.testing.config.TestingDatasetImportProperties;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * Loads {@link DatasetRow} records from the configured medical dataset CSV (filesystem or classpath).
 */
@Component
@ConditionalOnProperty(name = "triageos.testing.dataset.import-enabled", havingValue = "true", matchIfMissing = true)
public class MedicalDatasetCsvReader {

    public static final String COL_DISEASE = "Disease";
    public static final String COL_FEVER = "Fever";
    public static final String COL_COUGH = "Cough";
    public static final String COL_FATIGUE = "Fatigue";
    public static final String COL_DIFFICULTY_BREATHING = "Difficulty Breathing";
    public static final String COL_AGE = "Age";
    public static final String COL_GENDER = "Gender";
    public static final String COL_BLOOD_PRESSURE = "Blood Pressure";
    public static final String COL_CHOLESTEROL = "Cholesterol Level";
    public static final String COL_OUTCOME = "Outcome Variable";

    private final TestingDatasetImportProperties properties;
    private final TestingDatasetPathResolver pathResolver;
    private final ResourceLoader resourceLoader;

    public MedicalDatasetCsvReader(
            TestingDatasetImportProperties properties,
            TestingDatasetPathResolver pathResolver,
            ResourceLoader resourceLoader) {
        this.properties = properties;
        this.pathResolver = pathResolver;
        this.resourceLoader = resourceLoader;
    }

    /**
     * Human-readable description of the load source (for errors and logs).
     */
    public String describeSource() {
        String configured = properties.getCsvPath();
        if (configured != null && !configured.isBlank()) {
            return configured.trim();
        }
        return pathResolver.resolveFilesystemDataset().toString();
    }

    /**
     * Reads all data rows (header skipped). Row indices are zero-based in the data section (first data row = 0).
     */
    public List<DatasetRow> readAll() throws IOException {
        try (Reader reader = openReader()) {
            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreEmptyLines(true)
                    .setTrim(true)
                    .build();
            try (CSVParser parser = new CSVParser(reader, format)) {
                List<DatasetRow> rows = new ArrayList<>();
                int i = 0;
                for (CSVRecord record : parser) {
                    rows.add(mapRecord(record, i++));
                }
                return rows;
            }
        }
    }

    private Reader openReader() throws IOException {
        String configured = properties.getCsvPath();
        if (configured != null && !configured.isBlank()) {
            String c = configured.trim();
            if (c.startsWith("classpath:")) {
                Resource resource = resourceLoader.getResource(c);
                if (!resource.exists() || !resource.isReadable()) {
                    throw new IOException("Dataset CSV not found or not readable: " + c);
                }
                return new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            }
            Path path = Paths.get(c);
            if (!path.isAbsolute()) {
                path = Paths.get(System.getProperty("user.dir")).resolve(path).normalize();
            }
            if (!Files.isRegularFile(path)) {
                throw new IOException("Dataset CSV not found at: " + path);
            }
            return Files.newBufferedReader(path, StandardCharsets.UTF_8);
        }

        Path path = pathResolver.resolveFilesystemDataset();
        if (!Files.isRegularFile(path)) {
            throw new IOException("Dataset CSV not found at: " + path);
        }
        return Files.newBufferedReader(path, StandardCharsets.UTF_8);
    }

    private static DatasetRow mapRecord(CSVRecord record, int rowIndex) {
        int age = parseAge(record.get(COL_AGE));
        return new DatasetRow(
                rowIndex,
                text(record, COL_DISEASE),
                text(record, COL_FEVER),
                text(record, COL_COUGH),
                text(record, COL_FATIGUE),
                text(record, COL_DIFFICULTY_BREATHING),
                age,
                text(record, COL_GENDER),
                text(record, COL_BLOOD_PRESSURE),
                text(record, COL_CHOLESTEROL),
                text(record, COL_OUTCOME)
        );
    }

    private static String text(CSVRecord record, String column) {
        try {
            String v = record.get(column);
            return v != null ? v.trim() : "";
        } catch (IllegalArgumentException e) {
            return "";
        }
    }

    private static int parseAge(String raw) {
        if (raw == null || raw.isBlank()) {
            return 0;
        }
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
