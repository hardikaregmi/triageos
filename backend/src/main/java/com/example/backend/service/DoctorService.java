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

    public Doctor createDoctor(String name, String specialty, String status) {
        Doctor doctor = new Doctor();
        doctor.setName(name);
        doctor.setSpecialty(specialty);
        doctor.setStatus(status != null && !status.isBlank() ? status : "available");
        return doctorRepository.save(doctor);
    }

    public boolean deleteDoctor(long id) {
        return doctorRepository.deleteById(id);
    }
}
