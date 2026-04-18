package com.example.backend;

import com.example.backend.config.AdminNurseProperties;
import com.example.backend.config.JwtProperties;
import com.example.backend.config.NurseBootstrapProperties;
import com.example.backend.testing.config.TestingDatasetImportProperties;
import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

// Starts the Spring Boot app.
@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
@EnableConfigurationProperties({
        TestingDatasetImportProperties.class,
        JwtProperties.class,
        NurseBootstrapProperties.class,
        AdminNurseProperties.class
})
public class BackendApplication {
    public static void main(String[] args) {
        loadEnvFile();
        SpringApplication.run(BackendApplication.class, args);
    }

    /**
     * Loads the first {@code .env} found in the working directory or any ancestor (typically repo root).
     * Keys become system properties and override {@code application.properties}.
     */
    static void loadEnvFile() {
        Path dir = Path.of("").toAbsolutePath();
        for (int depth = 0; depth < 10; depth++) {
            Path envFile = dir.resolve(".env");
            if (Files.isRegularFile(envFile)) {
                try (Reader reader = Files.newBufferedReader(envFile, StandardCharsets.UTF_8)) {
                    Properties p = new Properties();
                    p.load(reader);
                    for (String name : p.stringPropertyNames()) {
                        String value = p.getProperty(name);
                        if (value != null) {
                            System.setProperty(name, value.strip());
                        }
                    }
                } catch (IOException e) {
                    throw new UncheckedIOException("Failed to load " + envFile, e);
                }
                return;
            }
            Path parent = dir.getParent();
            if (parent == null) {
                break;
            }
            dir = parent;
        }
    }
}
