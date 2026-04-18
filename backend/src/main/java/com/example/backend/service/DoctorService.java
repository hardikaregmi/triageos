package com.example.backend.service;

import com.example.backend.model.Doctor;
import com.example.backend.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public List<Doctor> listDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> updateStatus(long id, String status) {
        return doctorRepository.updateStatus(id, status);
    }
}
