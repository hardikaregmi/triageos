package com.example.backend.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CreateDoctorAlertRequest(
        Long patientId,
        Long doctorId,
        String nurseId,
        String message,
        String priority) {
}
