package com.example.backend;

public class Patient {
    private long id;
    private String name;
    private int heartRate;
    private double temperature;
    private int wbc;
    private String risk;
    private String message;
    private String reasoning;
    private String confidence;
    private String assignedDoctor;

    public Patient() {
    }

    public Patient(long id, String name, int heartRate, double temperature, int wbc) {
        this.id = id;
        this.name = name;
        this.heartRate = heartRate;
        this.temperature = temperature;
        this.wbc = wbc;
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

    public int getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(int heartRate) {
        this.heartRate = heartRate;
    }

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public int getWbc() {
        return wbc;
    }

    public void setWbc(int wbc) {
        this.wbc = wbc;
    }

    public String getRisk() {
        return risk;
    }

    public void setRisk(String risk) {
        this.risk = risk;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }

    public String getAssignedDoctor() {
        return assignedDoctor;
    }

    public void setAssignedDoctor(String assignedDoctor) {
        this.assignedDoctor = assignedDoctor;
    }
}
