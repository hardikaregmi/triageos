package com.example.backend.repository;

import com.example.backend.model.Patient;

import java.util.List;
import java.util.Optional;

public interface PatientRepository {

    List<Patient> findAll();

    Optional<Patient> findById(long id);

    Patient save(Patient patient);

    boolean deleteById(long id);
}
