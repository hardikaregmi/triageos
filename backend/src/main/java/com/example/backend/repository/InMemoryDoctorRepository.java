package com.example.backend.repository;

import com.example.backend.model.Doctor;
import com.example.backend.model.Hospital;
import com.example.backend.model.StaffRole;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class InMemoryDoctorRepository implements DoctorRepository {

    private final Map<Long, Doctor> doctors = new ConcurrentHashMap<>();
    /** Next id for dynamically added doctors (seed uses 1–4). */
    private final AtomicLong idGenerator = new AtomicLong(5);

    public InMemoryDoctorRepository() {
        seedDoctors();
    }

    private void seedDoctors() {
        saveDoctor(new Doctor(1L, "Dr. Patel", "Internal Medicine", "available"));
        saveDoctor(new Doctor(2L, "Dr. Nguyen", "Emergency Medicine", "available"));
        saveDoctor(new Doctor(3L, "Dr. Smith", "General Practice", "busy"));
        saveDoctor(new Doctor(4L, "Dr. Carter", "Cardiology", "available"));
    }

    private void saveDoctor(Doctor doctor) {
        doctors.put(doctor.getId(), doctor);
    }

    @Override
    public List<Doctor> findAll() {
        List<Doctor> list = new ArrayList<>(doctors.values());
        list.sort(Comparator.comparing(Doctor::getId));
        return list;
    }

    @Override
    public Optional<Doctor> findById(long id) {
        return Optional.ofNullable(doctors.get(id));
    }

    @Override
    public synchronized Optional<Doctor> updateStatus(long id, String status) {
        Doctor doctor = doctors.get(id);
        if (doctor == null) {
            return Optional.empty();
        }
        doctor.setStatus(status);
        return Optional.of(doctor);
    }

    @Override
    public synchronized Doctor save(Doctor doctor) {
        if (doctor.getHospitalId() == null) {
            doctor.setHospitalId(Hospital.DEFAULT_ID);
        }
        if (doctor.getRole() == null) {
            doctor.setRole(StaffRole.DOCTOR);
        }
        if (doctor.getId() == null) {
            doctor.setId(idGenerator.getAndIncrement());
        }
        doctors.put(doctor.getId(), doctor);
        return doctor;
    }
}
