package com.example.backend.model;

/**
 * Tenant boundary for a deployment; multi-hospital support starts here.
 */
public class Hospital {

    /** Default in-memory hospital until full tenancy is configured. */
    public static final long DEFAULT_ID = 1L;

    private Long id;
    private String name;

    public Hospital() {
    }

    public Hospital(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
