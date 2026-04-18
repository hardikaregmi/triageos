package com.example.backend.repository;

import com.example.backend.model.Hospital;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryHospitalRepository implements HospitalRepository {

    private final Map<Long, Hospital> hospitals = new ConcurrentHashMap<>();

    public InMemoryHospitalRepository() {
        hospitals.put(Hospital.DEFAULT_ID, new Hospital(Hospital.DEFAULT_ID, "Default Medical Center"));
    }

    @Override
    public List<Hospital> findAll() {
        List<Hospital> list = new ArrayList<>(hospitals.values());
        list.sort(Comparator.comparing(Hospital::getId));
        return list;
    }

    @Override
    public Optional<Hospital> findById(long id) {
        return Optional.ofNullable(hospitals.get(id));
    }
}
