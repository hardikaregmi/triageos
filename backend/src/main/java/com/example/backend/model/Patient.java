package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonUnwrapped;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Patient {

    private Long id;
    /** Hospital (tenant) this encounter belongs to. */
    private Long hospitalId;
    /** Future: submitting staff user id when auth exists (nullable). */
    private Long userId;
    /** Stable non-PII patient-facing identifier (e.g. PT-0001). */
    private String patientIdentifier;
    private String fullName;
    private int age;
    private String sex;
    private String roomNumber;
    private int heartRate;
    private double temperature;
    private int wbc;
    private String bloodPressure;
    private double oxygenSaturation;
    private String chiefComplaint;
    private String symptomDuration;
    private int painLevel;
    private boolean fever;
    private boolean shortnessOfBreath;
    private boolean chestPain;
    private String arrivalTime;
    private String triageNurseName;
    private String departmentNeeded;
    private String priorityNote;
    /** True when created from the CSV testing import (privacy-safe display id in {@link #fullName}). */
    private boolean importedFromDataset;

    @JsonUnwrapped
    private TriageResult triageResult;

    @JsonGetter("name")
    public String getName() {
        return fullName;
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

    public String getPatientIdentifier() {
        return patientIdentifier;
    }

    public void setPatientIdentifier(String patientIdentifier) {
        this.patientIdentifier = patientIdentifier;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
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

    public String getBloodPressure() {
        return bloodPressure;
    }

    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
    }

    public double getOxygenSaturation() {
        return oxygenSaturation;
    }

    public void setOxygenSaturation(double oxygenSaturation) {
        this.oxygenSaturation = oxygenSaturation;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getSymptomDuration() {
        return symptomDuration;
    }

    public void setSymptomDuration(String symptomDuration) {
        this.symptomDuration = symptomDuration;
    }

    public int getPainLevel() {
        return painLevel;
    }

    public void setPainLevel(int painLevel) {
        this.painLevel = painLevel;
    }

    public boolean isFever() {
        return fever;
    }

    public void setFever(boolean fever) {
        this.fever = fever;
    }

    public boolean isShortnessOfBreath() {
        return shortnessOfBreath;
    }

    public void setShortnessOfBreath(boolean shortnessOfBreath) {
        this.shortnessOfBreath = shortnessOfBreath;
    }

    public boolean isChestPain() {
        return chestPain;
    }

    public void setChestPain(boolean chestPain) {
        this.chestPain = chestPain;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getTriageNurseName() {
        return triageNurseName;
    }

    public void setTriageNurseName(String triageNurseName) {
        this.triageNurseName = triageNurseName;
    }

    public String getDepartmentNeeded() {
        return departmentNeeded;
    }

    public void setDepartmentNeeded(String departmentNeeded) {
        this.departmentNeeded = departmentNeeded;
    }

    public String getPriorityNote() {
        return priorityNote;
    }

    public void setPriorityNote(String priorityNote) {
        this.priorityNote = priorityNote;
    }

    public boolean isImportedFromDataset() {
        return importedFromDataset;
    }

    public void setImportedFromDataset(boolean importedFromDataset) {
        this.importedFromDataset = importedFromDataset;
    }

    public TriageResult getTriageResult() {
        return triageResult;
    }

    public void setTriageResult(TriageResult triageResult) {
        this.triageResult = triageResult;
    }
}
