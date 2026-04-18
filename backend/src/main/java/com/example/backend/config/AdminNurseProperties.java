package com.example.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * When set, {@code POST /api/admin/nurses} accepts header {@code X-Admin-Key} to create accounts.
 * Leave empty to disable the endpoint.
 */
@ConfigurationProperties(prefix = "triageos.admin")
public record AdminNurseProperties(String nurseCreateKey) {
}
