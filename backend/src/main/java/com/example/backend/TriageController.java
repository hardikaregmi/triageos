package com.example.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class TriageController {
    private final TriageService triageService;

    public TriageController(TriageService triageService) {
        this.triageService = triageService;
    }

    @GetMapping("/patients")
    public List<Patient> getPatients() {
        return triageService.getPatients();
    }

    @PostMapping("/patients")
    public Patient createPatient(@RequestBody CreatePatientRequest request) {
        return triageService.addPatient(
                request.name(),
                request.heartRate(),
                request.temperature(),
                request.wbc()
        );
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable long id) {
        boolean removed = triageService.deletePatient(id);
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/doctors")
    public List<Doctor> getDoctors() {
        return triageService.getDoctors();
    }

    @GetMapping("/dashboard/summary")
    public TriageService.DashboardSummary getDashboardSummary() {
        return triageService.getDashboardSummary();
    }

    @PostMapping("/patients/{id}/triage")
    public ResponseEntity<Patient> triagePatient(@PathVariable long id) {
        Patient patient = triageService.triagePatient(id);
        return patient != null ? ResponseEntity.ok(patient) : ResponseEntity.notFound().build();
    }

    record CreatePatientRequest(String name, int heartRate, double temperature, int wbc) {
    }
}
