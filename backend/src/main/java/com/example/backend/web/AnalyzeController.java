package com.example.backend.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyzeController {

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeResponse> analyze(@RequestBody AnalyzeRequest input) {
        String risk;
        String message;
        String reasoning;
        String confidence;

        if (input.heartRate() >= 120 && input.temperature() >= 102 && input.wbc() >= 15000) {
            risk = "HIGH";
            message = "Severe infection risk";
            reasoning = "Very high heart rate, high fever, and elevated WBC suggest a severe infection pattern.";
            confidence = "92%";
        } else if (input.heartRate() > 100 && input.temperature() > 100 && input.wbc() > 12000) {
            risk = "HIGH";
            message = "Possible early sepsis risk";
            reasoning = "Elevated heart rate, fever, and high WBC may indicate an early infection pattern.";
            confidence = "92%";
        } else if (input.heartRate() > 110 && input.temperature() < 99) {
            risk = "HIGH";
            message = "Cardiac stress risk";
            reasoning = "High heart rate without fever may indicate cardiovascular strain.";
            confidence = "92%";
        } else if (input.temperature() > 102) {
            risk = "LOW";
            message = "Fever detected";
            reasoning = "High temperature present but other vitals are not critical.";
            confidence = "68%";
        } else {
            risk = "LOW";
            message = "No immediate high-risk signs detected";
            reasoning = "Current vital signs do not show a strong critical pattern.";
            confidence = "68%";
        }

        return ResponseEntity.ok(new AnalyzeResponse(risk, message, reasoning, confidence));
    }

    record AnalyzeRequest(int heartRate, double temperature, int wbc) {
    }

    record AnalyzeResponse(String risk, String message, String reasoning, String confidence) {
    }
}
