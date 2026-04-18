package com.example.backend.web.dto;

import com.example.backend.model.Patient;

public final class PatientIntakeMapper {

    private PatientIntakeMapper() {
    }

    public static Patient toNewPatient(PatientIntakeRequest r) {
        Patient p = new Patient();
        apply(p, r);
        return p;
    }

    /** Updates mutable intake fields only; does not change id, patientCode, or triage. */
    public static void apply(Patient p, PatientIntakeRequest r) {
        p.setFullName(r.fullName());
        p.setAge(r.age());
        p.setSex(r.sex());
        p.setRoomNumber(r.roomNumber());
        p.setHeartRate(r.heartRate());
        p.setTemperature(r.temperature());
        p.setWbc(r.wbc());
        p.setBloodPressure(r.bloodPressure());
        p.setOxygenSaturation(r.oxygenSaturation());
        p.setChiefComplaint(r.chiefComplaint());
        p.setSymptomDuration(r.symptomDuration());
        p.setPainLevel(r.painLevel());
        p.setFever(r.fever());
        p.setShortnessOfBreath(r.shortnessOfBreath());
        p.setChestPain(r.chestPain());
        p.setArrivalTime(r.arrivalTime());
        p.setTriageNurseName(r.triageNurseName());
        p.setDepartmentNeeded(r.departmentNeeded());
        p.setPriorityNote(r.priorityNote());
    }
}
