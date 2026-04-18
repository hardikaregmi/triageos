package com.example.backend.testing.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings for the dataset sample import utility (test/dev tooling, not production intake).
 */
@ConfigurationProperties(prefix = "triageos.testing.dataset")
public class TestingDatasetImportProperties {

    /**
     * When false, dataset import beans and HTTP endpoints are not registered.
     */
    private boolean importEnabled = true;

    /**
     * Optional path: absolute/relative file path, or {@code classpath:...} for packaged test fixtures.
     * When blank, the resolver searches {@code data/} under the working directory and its parent.
     */
    private String csvPath = "";

    public boolean isImportEnabled() {
        return importEnabled;
    }

    public void setImportEnabled(boolean importEnabled) {
        this.importEnabled = importEnabled;
    }

    public String getCsvPath() {
        return csvPath;
    }

    public void setCsvPath(String csvPath) {
        this.csvPath = csvPath;
    }
}
