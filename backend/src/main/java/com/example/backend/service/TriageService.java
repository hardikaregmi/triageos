package com.example.backend.service;

import com.example.backend.model.Doctor;
import com.example.backend.model.Patient;
import com.example.backend.model.TriageResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
@Service
public class TriageService {

    private static final Logger log = LoggerFactory.getLogger(TriageService.class);

    /**
     * Risk-based nurse follow-up interval (minutes). Uses triage priority / severity only; does not call OpenAI.
     */
    public int determineCheckIntervalMinutes(TriageResult result) {
        if (result == null) {
            return 180;
        }
        return minutesForTier(resolveMonitoringTier(result));
    }

    /**
     * Applies AI/rule triage-driven check intervals and monitoring flags after a {@link TriageResult} is set on the patient.
     * Patients who have never had a nurse check-in appear as needing check; others get a scheduled next check without
     * an immediate {@code needsCheck} flag unless they are already due.
     */
    public void applyMonitoringSchedule(Patient patient, TriageResult result) {
        if (result == null) {
            return;
        }
        int minutes = determineCheckIntervalMinutes(result);
        patient.setCheckIntervalMinutes(minutes);
        LocalDateTime now = LocalDateTime.now();
        patient.setNextCheckAt(now.plusMinutes(minutes));
        if (patient.getLastCheckedAt() == null) {
            patient.setNeedsCheck(true);
        } else {
            patient.setNeedsCheck(false);
        }
        boolean highAcuity = "HIGH".equals(result.getRisk());
        patient.setDoctorAlertRequired(highAcuity);
        if (highAcuity) {
            log.info(
                    "Doctor must check patient id={} within {} minutes (HIGH acuity)",
                    patient.getId(),
                    minutes);
        }
    }

    enum MonitoringTier {
        HIGH,
        MEDIUM,
        LOW
    }

    static MonitoringTier resolveMonitoringTier(TriageResult result) {
        if (result == null) {
            return MonitoringTier.LOW;
        }
        if ("HIGH".equals(result.getRisk())) {
            return MonitoringTier.HIGH;
        }
        String p = result.getPriority();
        if (p != null) {
            String up = p.toUpperCase(Locale.ROOT);
            if (up.contains("NON")) {
                return MonitoringTier.LOW;
            }
        }
        return MonitoringTier.MEDIUM;
    }

    /** Fixed minutes per tier for predictable scheduling (HIGH shortest, LOW longest). */
    private static int minutesForTier(MonitoringTier tier) {
        return switch (tier) {
            case HIGH -> 45;
            case MEDIUM -> 180;
            case LOW -> 720;
        };
    }

    public TriageResult triagePatient(Patient patient, List<Doctor> doctors) {
        TriageResult assessment = assessVitals(patient.getHeartRate(), patient.getTemperature(), patient.getWbc());
        String assignedDoctor = pickDoctor(assessment.getMessage(), doctors);
        assessment.setAssignedDoctor(assignedDoctor);
        enrichRuleBasedFields(assessment, assignedDoctor, doctors);
        return assessment;
    }

    private void enrichRuleBasedFields(TriageResult assessment, String assignedName, List<Doctor> doctors) {
        boolean high = "HIGH".equals(assessment.getRisk());
        assessment.setPriority(high ? "URGENT" : "LESS_URGENT");
        assessment.setConcern(assessment.getMessage());
        assessment.setRecommendedAction("Evaluate per facility protocol; monitor vitals and reassess.");
        doctors.stream()
                .filter(d -> Objects.equals(d.getName(), assignedName))
                .findFirst()
                .ifPresent(d -> assessment.setSuggestedSpecialty(d.getSpecialty()));
    }

    private TriageResult assessVitals(int heartRate, double temperature, int wbc) {
        if (heartRate >= 120 && temperature >= 102 && wbc >= 15000) {
            return new TriageResult(
                    "HIGH",
                    "Severe infection risk",
                    "Very high heart rate, high fever, and elevated WBC suggest a severe infection pattern.",
                    "92%",
                    null
            );
        }
        if (heartRate > 100 && temperature > 100 && wbc > 12000) {
            return new TriageResult(
                    "HIGH",
                    "Possible early sepsis risk",
                    "Elevated heart rate, fever, and high WBC may indicate an early infection pattern.",
                    "92%",
                    null
            );
        }
        if (heartRate > 110 && temperature < 99) {
            return new TriageResult(
                    "HIGH",
                    "Cardiac stress risk",
                    "High heart rate without fever may indicate cardiovascular strain.",
                    "92%",
                    null
            );
        }
        if (temperature > 102) {
            return new TriageResult(
                    "LOW",
                    "Fever detected",
                    "High temperature present but other vitals are not critical.",
                    "68%",
                    null
            );
        }
        return new TriageResult(
                "LOW",
                "No immediate high-risk signs detected",
                "Current vital signs do not show a strong critical pattern.",
                "68%",
                null
        );
    }

    private String pickDoctor(String message, List<Doctor> doctors) {
        List<String> preferred;
        if ("Severe infection risk".equals(message) || "Possible early sepsis risk".equals(message)) {
            preferred = List.of("Dr. Nguyen", "Dr. Patel");
        } else if ("Cardiac stress risk".equals(message)) {
            preferred = List.of("Dr. Carter", "Dr. Patel");
        } else {
            preferred = List.of("Dr. Patel", "Dr. Smith");
        }

        Doctor preferredAvailable = doctors.stream()
                .filter(d -> preferred.contains(d.getName()))
                .filter(d -> "available".equalsIgnoreCase(d.getStatus()))
                .min(Comparator.comparingInt(d -> preferred.indexOf(d.getName())))
                .orElse(null);
        if (preferredAvailable != null) {
            return preferredAvailable.getName();
        }

        Doctor anyAvailable = doctors.stream()
                .filter(d -> "available".equalsIgnoreCase(d.getStatus()))
                .findFirst()
                .orElse(null);
        if (anyAvailable != null) {
            return anyAvailable.getName();
        }

        Doctor fallback = doctors.stream()
                .filter(d -> preferred.contains(d.getName()))
                .min(Comparator.comparingInt(d -> preferred.indexOf(d.getName())))
                .orElse(null);
        return fallback != null ? fallback.getName() : null;
    }
}
