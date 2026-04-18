package com.example.backend.testing.dataset;

import com.example.backend.testing.config.TestingDatasetImportProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Resolves the on-disk dataset CSV when no explicit {@code classpath:} or file path is configured.
 */
@Component
@ConditionalOnProperty(name = "triageos.testing.dataset.import-enabled", havingValue = "true", matchIfMissing = true)
public class TestingDatasetPathResolver {

    private static final String FILENAME = "Disease_symptom_and_patient_profile_dataset.csv";

    private final TestingDatasetImportProperties properties;

    public TestingDatasetPathResolver(TestingDatasetImportProperties properties) {
        this.properties = properties;
    }

    /**
     * Resolves a filesystem path for auto-discovery (used when {@code csv-path} is not set to a classpath resource).
     */
    public Path resolveFilesystemDataset() {
        String configured = properties.getCsvPath();
        if (configured != null && !configured.isBlank() && !configured.trim().startsWith("classpath:")) {
            Path p = Paths.get(configured.trim());
            if (!p.isAbsolute()) {
                p = Paths.get(System.getProperty("user.dir")).resolve(p).normalize();
            }
            return p.toAbsolutePath().normalize();
        }

        Path cwd = Paths.get(System.getProperty("user.dir")).normalize();
        List<Path> candidates = List.of(
                cwd.resolve("data").resolve(FILENAME),
                cwd.resolve("..").resolve("data").resolve(FILENAME)
        );
        for (Path c : candidates) {
            Path abs = c.toAbsolutePath().normalize();
            if (Files.isRegularFile(abs)) {
                return abs;
            }
        }
        return candidates.get(0).toAbsolutePath().normalize();
    }
}
