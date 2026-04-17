package com.example.backend;

public class Doctor {
    private long id;
    private String name;
    private String specialty;
    private String status;

    public Doctor() {
    }

    public Doctor(long id, String name, String specialty, String status) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.status = status;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
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
