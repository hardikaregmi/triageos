package com.example.backend.repository;

import com.example.backend.model.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NurseRepository extends JpaRepository<Nurse, Long> {

    Optional<Nurse> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);
}
