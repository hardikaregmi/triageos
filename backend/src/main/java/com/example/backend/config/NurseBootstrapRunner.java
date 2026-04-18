package com.example.backend.config;

import com.example.backend.model.Hospital;
import com.example.backend.model.Nurse;
import com.example.backend.model.StaffRole;
import com.example.backend.repository.NurseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class NurseBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(NurseBootstrapRunner.class);

    private final NurseRepository nurseRepository;
    private final PasswordEncoder passwordEncoder;
    private final NurseBootstrapProperties bootstrap;

    public NurseBootstrapRunner(
            NurseRepository nurseRepository,
            PasswordEncoder passwordEncoder,
            NurseBootstrapProperties bootstrap
    ) {
        this.nurseRepository = nurseRepository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrap = bootstrap;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (nurseRepository.count() > 0) {
            return;
        }
        if (!StringUtils.hasText(bootstrap.username()) || !StringUtils.hasText(bootstrap.password())) {
            log.warn(
                    "No nurse accounts exist and triageos.nurse.bootstrap.username/password are not set; "
                            + "sign-in will be unavailable until an account is created."
            );
            return;
        }
        String user = bootstrap.username().trim().toLowerCase();
        Nurse nurse = new Nurse();
        nurse.setHospitalId(Hospital.DEFAULT_ID);
        nurse.setUsername(user);
        nurse.setPasswordHash(passwordEncoder.encode(bootstrap.password()));
        nurse.setDisplayName(
                StringUtils.hasText(bootstrap.displayName()) ? bootstrap.displayName().trim() : user
        );
        nurse.setRole(StaffRole.NURSE);
        nurseRepository.save(nurse);
        log.info("Created initial nurse account for username '{}'.", user);
    }
}
