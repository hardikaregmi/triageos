package com.example.backend.web;

import com.example.backend.model.Doctor;
import com.example.backend.service.DoctorService;
import com.example.backend.web.dto.DoctorCreateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/doctors")
    public List<Doctor> getDoctors() {
        return doctorService.listDoctors();
    }

    @PatchMapping("/doctors/{id}/status")
    public ResponseEntity<Doctor> updateDoctorStatus(
            @PathVariable long id,
            @RequestBody UpdateDoctorStatusRequest request) {
        return doctorService.updateStatus(id, request.status())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/doctors")
    public ResponseEntity<Doctor> createDoctor(@RequestBody DoctorCreateRequest request) {
        if (request == null
                || request.name() == null
                || request.name().isBlank()
                || request.specialty() == null
                || request.specialty().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Doctor created = doctorService.createDoctor(
                request.name().trim(), request.specialty().trim(), request.status());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable long id) {
        if (!doctorService.deleteDoctor(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    record UpdateDoctorStatusRequest(String status) {
    }
}
