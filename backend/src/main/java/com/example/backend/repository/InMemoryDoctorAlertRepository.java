package com.example.backend.repository;

import com.example.backend.model.DoctorAlert;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class InMemoryDoctorAlertRepository {

    private final Map<Long, DoctorAlert> store = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public DoctorAlert save(DoctorAlert alert) {
        if (alert.getId() == null) {
            alert.setId(idGenerator.getAndIncrement());
        }
        store.put(alert.getId(), alert);
        return alert;
    }

    public Optional<DoctorAlert> findById(long id) {
        return Optional.ofNullable(store.get(id));
    }

    public List<DoctorAlert> findByDoctorIdNewestFirst(long doctorId) {
        return store.values().stream()
                .filter(a -> a.getDoctorId() != null && a.getDoctorId() == doctorId)
                .sorted(Comparator.comparing(DoctorAlert::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .reversed())
                .collect(Collectors.toList());
    }
}
