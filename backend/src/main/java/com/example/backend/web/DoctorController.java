package com.example.backend.web;

import com.example.backend.model.Doctor;
import com.example.backend.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    record UpdateDoctorStatusRequest(String status) {
    }
}
