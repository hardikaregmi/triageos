package com.example.backend.model;

public class Doctor {

    private Long id;
    private String name;
    private String specialty;
    private String status;

    public Doctor() {
    }

    public Doctor(Long id, String name, String specialty, String status) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.status = status;
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

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
