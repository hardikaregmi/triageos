package com.example.backend.service;

import com.example.backend.config.JwtProperties;
import com.example.backend.model.Nurse;
import com.example.backend.repository.NurseRepository;
import com.example.backend.security.JwtService;
import com.example.backend.web.dto.NurseLoginRequest;
import com.example.backend.web.dto.NurseLoginResponse;
import com.example.backend.web.dto.NursePublicDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class NurseAuthService {

    private final NurseRepository nurseRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public NurseAuthService(
            NurseRepository nurseRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JwtProperties jwtProperties
    ) {
        this.nurseRepository = nurseRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    @Transactional(readOnly = true)
    public Optional<NurseLoginResponse> login(NurseLoginRequest request) {
        if (request == null || !StringUtils.hasText(request.username()) || !StringUtils.hasText(request.password())) {
            return Optional.empty();
        }
        String username = request.username().trim().toLowerCase();
        Optional<Nurse> found = nurseRepository.findByUsernameIgnoreCase(username);
        if (found.isEmpty()) {
            return Optional.empty();
        }
        Nurse nurse = found.get();
        if (!passwordEncoder.matches(request.password(), nurse.getPasswordHash())) {
            return Optional.empty();
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("nurseId", nurse.getId());
        claims.put("displayName", nurse.getDisplayName());
        String token = jwtService.createToken(username, claims);
        long expSec = Math.max(1L, jwtProperties.expirationMs() / 1000);
        NursePublicDto dto = new NursePublicDto(nurse.getId(), nurse.getUsername(), nurse.getDisplayName());
        return Optional.of(new NurseLoginResponse(token, "Bearer", expSec, dto));
    }

    @Transactional(readOnly = true)
    public Optional<NursePublicDto> profileForUsername(String username) {
        if (!StringUtils.hasText(username)) {
            return Optional.empty();
        }
        return nurseRepository
                .findByUsernameIgnoreCase(username.trim().toLowerCase())
                .map(n -> new NursePublicDto(n.getId(), n.getUsername(), n.getDisplayName()));
    }
}
