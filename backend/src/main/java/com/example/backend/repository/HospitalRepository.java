package com.example.backend.repository;

import com.example.backend.model.Hospital;

import java.util.List;
import java.util.Optional;

public interface HospitalRepository {

    List<Hospital> findAll();

    Optional<Hospital> findById(long id);
}
