package com.example.backend.web;

import com.example.backend.model.DoctorAlert;
import com.example.backend.service.DoctorAlertService;
import com.example.backend.web.dto.CreateDoctorAlertRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorAlertController {

    private final DoctorAlertService doctorAlertService;

    public DoctorAlertController(DoctorAlertService doctorAlertService) {
        this.doctorAlertService = doctorAlertService;
    }

    @PostMapping("/alerts")
    public ResponseEntity<DoctorAlert> createAlert(@RequestBody CreateDoctorAlertRequest body) {
        return ResponseEntity.ok(doctorAlertService.create(body));
    }

    @GetMapping("/doctors/{id}/alerts")
    public List<DoctorAlert> listAlertsForDoctor(@PathVariable long id) {
        return doctorAlertService.listForDoctor(id);
    }

    @PatchMapping("/alerts/{id}/acknowledge")
    public ResponseEntity<DoctorAlert> acknowledge(@PathVariable long id) {
        return ResponseEntity.ok(doctorAlertService.acknowledge(id));
    }
}
