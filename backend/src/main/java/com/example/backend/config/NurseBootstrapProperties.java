package com.example.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * When the database has no nurse accounts, one account is created from these values.
 * Override via environment or application properties in production.
 */
@ConfigurationProperties(prefix = "triageos.nurse.bootstrap")
public record NurseBootstrapProperties(String username, String password, String displayName) {
}
