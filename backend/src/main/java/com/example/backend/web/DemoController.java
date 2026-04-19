package com.example.backend.web;

import com.example.backend.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Demo-only endpoints for resetting in-memory monitoring state before a presentation. Not for production use.
 */
@RestController
@RequestMapping("/demo")
@CrossOrigin(origins = "http://localhost:3000")
public class DemoController {

    private final PatientService patientService;

    public DemoController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/reset-checks")
    public ResponseEntity<Map<String, Object>> resetChecks() {
        int[] counts = patientService.resetDemoChecks();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("resetToNeedsCheck", counts[0]);
        body.put("keptChecked", counts[1]);
        body.put("untouched", counts[2]);
        body.put("at", Instant.now().toString());
        return ResponseEntity.ok(body);
    }
}
