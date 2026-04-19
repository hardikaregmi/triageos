package com.example.backend.service;

import com.example.backend.model.DoctorAlert;
import com.example.backend.model.DoctorAlertStatus;
import com.example.backend.repository.DoctorRepository;
import com.example.backend.repository.InMemoryDoctorAlertRepository;
import com.example.backend.repository.PatientRepository;
import com.example.backend.web.dto.CreateDoctorAlertRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class DoctorAlertService {

    private final InMemoryDoctorAlertRepository alertRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAlertService(
            InMemoryDoctorAlertRepository alertRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {
        this.alertRepository = alertRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public DoctorAlert create(CreateDoctorAlertRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Body required");
        }
        if (req.patientId() == null || req.doctorId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "patientId and doctorId are required");
        }
        if (req.nurseId() == null || req.nurseId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "nurseId is required");
        }
        if (req.message() == null || req.message().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "message is required");
        }
        patientRepository
                .findById(req.patientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        doctorRepository
                .findById(req.doctorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));

        String priority = req.priority() != null && !req.priority().isBlank() ? req.priority().trim() : "HIGH";

        DoctorAlert alert = new DoctorAlert();
        alert.setPatientId(req.patientId());
        alert.setDoctorId(req.doctorId());
        alert.setNurseId(req.nurseId().trim());
        alert.setMessage(req.message().trim());
        alert.setPriority(priority);
        alert.setCreatedAt(Instant.now());
        alert.setStatus(DoctorAlertStatus.UNREAD);
        return alertRepository.save(alert);
    }

    public List<DoctorAlert> listForDoctor(long doctorId) {
        doctorRepository.findById(doctorId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
        return alertRepository.findByDoctorIdNewestFirst(doctorId);
    }

    public DoctorAlert acknowledge(long alertId) {
        DoctorAlert alert = alertRepository
                .findById(alertId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));
        alert.setStatus(DoctorAlertStatus.ACKNOWLEDGED);
        return alertRepository.save(alert);
    }
}
