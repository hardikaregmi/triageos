package com.example.backend.repository;

import com.example.backend.model.Hospital;
import com.example.backend.model.Nurse;
import com.example.backend.model.StaffRole;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class InMemoryNurseRepository implements NurseRepository {

    private final Map<Long, Nurse> nurses = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(3);

    public InMemoryNurseRepository() {
        seedNurses();
    }

    private void seedNurses() {
        putNurse(new Nurse(1L, Hospital.DEFAULT_ID, null, StaffRole.NURSE, "N. Morgan"));
        putNurse(new Nurse(2L, Hospital.DEFAULT_ID, null, StaffRole.NURSE, "J. Lee"));
    }

    private void putNurse(Nurse nurse) {
        nurses.put(nurse.getId(), nurse);
    }

    @Override
    public List<Nurse> findAll() {
        List<Nurse> list = new ArrayList<>(nurses.values());
        list.sort(Comparator.comparing(Nurse::getId));
        return list;
    }

    @Override
    public List<Nurse> findByHospitalId(long hospitalId) {
        return nurses.values().stream()
                .filter(n -> n.getHospitalId() != null && n.getHospitalId() == hospitalId)
                .sorted(Comparator.comparing(Nurse::getId))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Nurse> findById(long id) {
        return Optional.ofNullable(nurses.get(id));
    }

    @Override
    public synchronized Nurse save(Nurse nurse) {
        if (nurse.getHospitalId() == null) {
            nurse.setHospitalId(Hospital.DEFAULT_ID);
        }
        if (nurse.getRole() == null) {
            nurse.setRole(StaffRole.NURSE);
        }
        if (nurse.getId() == null) {
            nurse.setId(idGenerator.getAndIncrement());
        }
        nurses.put(nurse.getId(), nurse);
        return nurse;
    }
}
