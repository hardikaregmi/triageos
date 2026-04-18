package com.example.backend.web;

import com.example.backend.config.AdminNurseProperties;
import com.example.backend.service.NurseAccountService;
import com.example.backend.web.dto.NurseCreateRequest;
import com.example.backend.web.dto.NursePublicDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/nurses")
public class AdminNurseController {

    public static final String ADMIN_KEY_HEADER = "X-Admin-Key";

    private final AdminNurseProperties adminProperties;
    private final NurseAccountService nurseAccountService;

    public AdminNurseController(AdminNurseProperties adminProperties, NurseAccountService nurseAccountService) {
        this.adminProperties = adminProperties;
        this.nurseAccountService = nurseAccountService;
    }

    @PostMapping
    public ResponseEntity<NursePublicDto> createNurse(
            @RequestHeader(value = ADMIN_KEY_HEADER, required = false) String adminKey,
            @RequestBody NurseCreateRequest request
    ) {
        if (!StringUtils.hasText(adminProperties.nurseCreateKey())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (!StringUtils.hasText(adminKey) || !adminProperties.nurseCreateKey().equals(adminKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(nurseAccountService.createAccount(request));
    }
}
