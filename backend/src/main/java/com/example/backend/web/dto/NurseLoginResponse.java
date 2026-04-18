package com.example.backend.web.dto;

public record NurseLoginResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        NursePublicDto nurse
) {
}
