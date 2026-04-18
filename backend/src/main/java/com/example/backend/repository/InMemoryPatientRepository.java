package com.example.backend.repository;

import com.example.backend.model.Patient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class InMemoryPatientRepository implements PatientRepository {

    private final Map<Long, Patient> patients = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    @Override
    public List<Patient> findAll() {
        List<Patient> list = new ArrayList<>(patients.values());
        list.sort(Comparator.comparing(Patient::getId));
        return list;
    }

    @Override
    public Optional<Patient> findById(long id) {
        return Optional.ofNullable(patients.get(id));
    }

    @Override
    public synchronized Patient save(Patient patient) {
        if (patient.getId() == null) {
            patient.setId(idGenerator.getAndIncrement());
        }
        patients.put(patient.getId(), patient);
        return patient;
    }

    @Override
    public synchronized boolean deleteById(long id) {
        return patients.remove(id) != null;
    }
}
