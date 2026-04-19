package com.example.backend.web.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Body for {@code POST /patients/{id}/check}.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record PatientCheckRequest(
        @JsonProperty("nurseId") String nurseId,
        @JsonAlias("checkNotes") @JsonProperty("notes") String notes) {
}
