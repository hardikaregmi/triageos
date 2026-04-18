package com.example.backend.repository;

import com.example.backend.model.Doctor;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository {

    List<Doctor> findAll();

    Optional<Doctor> findById(long id);

    Optional<Doctor> updateStatus(long id, String status);

    /** Persist a new doctor or replace by id (for future hospital-scoped admin flows). */
    Doctor save(Doctor doctor);
}
