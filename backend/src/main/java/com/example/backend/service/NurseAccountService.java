package com.example.backend.service;

import com.example.backend.model.Hospital;
import com.example.backend.model.Nurse;
import com.example.backend.model.StaffRole;
import com.example.backend.repository.NurseRepository;
import com.example.backend.web.dto.NurseCreateRequest;
import com.example.backend.web.dto.NursePublicDto;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NurseAccountService {

    private final NurseRepository nurseRepository;
    private final PasswordEncoder passwordEncoder;

    public NurseAccountService(NurseRepository nurseRepository, PasswordEncoder passwordEncoder) {
        this.nurseRepository = nurseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public NursePublicDto createAccount(NurseCreateRequest request) {
        if (request == null
                || !StringUtils.hasText(request.username())
                || !StringUtils.hasText(request.password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password required");
        }
        String username = request.username().trim().toLowerCase();
        if (nurseRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "username already taken");
        }
        Nurse nurse = new Nurse();
        nurse.setHospitalId(Hospital.DEFAULT_ID);
        nurse.setUsername(username);
        nurse.setPasswordHash(passwordEncoder.encode(request.password()));
        nurse.setDisplayName(
                StringUtils.hasText(request.displayName()) ? request.displayName().trim() : username
        );
        nurse.setRole(StaffRole.NURSE);
        Nurse saved = nurseRepository.save(nurse);
        return new NursePublicDto(saved.getId(), saved.getUsername(), saved.getDisplayName());
    }
}
