package com.example.backend.scheduler;

import com.example.backend.service.PatientService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PatientMonitoringScheduler {

    private final PatientService patientService;

    public PatientMonitoringScheduler(PatientService patientService) {
        this.patientService = patientService;
    }

    @Scheduled(fixedRate = 60_000)
    public void refreshDueChecks() {
        patientService.refreshDuePatientChecks();
    }
}
