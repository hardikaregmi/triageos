package com.example.backend.model;

/**
 * Nurse roster entry scoped to a hospital; distinct from {@link Doctor} but same role model.
 */
public class Nurse {

    private Long id;
    private Long hospitalId;
    /** Future link to authenticated platform user (nullable until auth exists). */
    private Long userId;
    private StaffRole role = StaffRole.NURSE;
    private String name;

    public Nurse() {
    }

    public Nurse(Long id, Long hospitalId, Long userId, StaffRole role, String name) {
        this.id = id;
        this.hospitalId = hospitalId;
        this.userId = userId;
        this.role = role != null ? role : StaffRole.NURSE;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public StaffRole getRole() {
        return role;
    }

    public void setRole(StaffRole role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
