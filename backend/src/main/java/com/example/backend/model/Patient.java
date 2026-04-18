package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_code", length = 32)
    private String patientCode;

    @Column(name = "hospital_id")
    private Long hospitalId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name", length = 512)
    private String fullName;

    @Column(name = "age")
    private int age;

    @Column(name = "sex", length = 32)
    private String sex;

    @Column(name = "room_number", length = 64)
    private String roomNumber;

    @Column(name = "heart_rate")
    private int heartRate;

    @Column(name = "temperature")
    private double temperature;

    @Column(name = "wbc")
    private int wbc;

    @Column(name = "blood_pressure", length = 64)
    private String bloodPressure;

    @Column(name = "oxygen_saturation")
    private double oxygenSaturation;

    @Column(name = "chief_complaint", length = 2048)
    private String chiefComplaint;

    @Column(name = "symptom_duration", length = 256)
    private String symptomDuration;

    @Column(name = "pain_level")
    private int painLevel;

    @Column(name = "fever")
    private boolean fever;

    @Column(name = "shortness_of_breath")
    private boolean shortnessOfBreath;

    @Column(name = "chest_pain")
    private boolean chestPain;

    @Column(name = "arrival_time", length = 128)
    private String arrivalTime;

    @Column(name = "triage_nurse_name", length = 256)
    private String triageNurseName;

    @Column(name = "department_needed", length = 256)
    private String departmentNeeded;

    @Column(name = "priority_note", length = 2048)
    private String priorityNote;

    @Column(name = "imported_from_dataset")
    private boolean importedFromDataset;

    @Embedded
    @JsonUnwrapped
    private TriageResult triageResult;

    public Patient() {
    }

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

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
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
