package com.example.backend.model;

import java.time.Instant;

/**
 * Internal escalation from a nurse to a physician about a patient (not a chat message).
 */
public class DoctorAlert {

    private Long id;
    private Long patientId;
    private Long doctorId;
    private String nurseId;
    private String message;
    private String priority;
    private Instant createdAt;
    private DoctorAlertStatus status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getNurseId() {
        return nurseId;
    }

    public void setNurseId(String nurseId) {
        this.nurseId = nurseId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public DoctorAlertStatus getStatus() {
        return status;
    }

    public void setStatus(DoctorAlertStatus status) {
        this.status = status;
    }
}
