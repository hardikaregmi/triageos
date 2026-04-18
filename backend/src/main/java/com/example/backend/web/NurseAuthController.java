package com.example.backend.web;

import com.example.backend.service.NurseAuthService;
import com.example.backend.web.dto.NurseLoginRequest;
import com.example.backend.web.dto.NurseLoginResponse;
import com.example.backend.web.dto.NursePublicDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/nurse")
public class NurseAuthController {

    private final NurseAuthService nurseAuthService;

    public NurseAuthController(NurseAuthService nurseAuthService) {
        this.nurseAuthService = nurseAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<NurseLoginResponse> login(@RequestBody NurseLoginRequest request) {
        return nurseAuthService
                .login(request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @GetMapping("/me")
    public ResponseEntity<NursePublicDto> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return nurseAuthService
                .profileForUsername(authentication.getName())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
