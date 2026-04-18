package com.example.backend.repository;

import com.example.backend.model.Nurse;

import java.util.List;
import java.util.Optional;

public interface NurseRepository {

    List<Nurse> findAll();

    List<Nurse> findByHospitalId(long hospitalId);

    Optional<Nurse> findById(long id);

    Nurse save(Nurse nurse);
}
