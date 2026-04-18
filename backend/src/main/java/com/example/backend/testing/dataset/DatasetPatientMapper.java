package com.example.backend.testing.dataset;

import com.example.backend.model.Patient;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Maps a {@link DatasetRow} into a {@link Patient} for {@link com.example.backend.service.PatientService#createPatient}.
 */
public final class DatasetPatientMapper {

    private static final String NURSE = "Dataset Nurse";
    private static final String NOTE = "Imported from public dataset";
    private static final DateTimeFormatter ARRIVAL_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneId.systemDefault());

    private DatasetPatientMapper() {
    }

    /**
     * @param csvRowIndex zero-based index of this row in the dataset (for stable naming)
     */
    public static Patient toPatient(DatasetRow row, int csvRowIndex) {
        Patient p = new Patient();
        int displayNum = csvRowIndex + 1;
        p.setFullName("Dataset Patient " + displayNum);
        p.setRoomNumber("SIM-" + displayNum);
        p.setAge(Math.max(row.age(), 1));
        p.setSex(normalizeSex(row.gender()));
        p.setBloodPressure(row.bloodPressure().isBlank() ? "Unknown" : row.bloodPressure());

        boolean fever = isYes(row.fever());
        boolean sob = isYes(row.difficultyBreathing());
        p.setFever(fever);
        p.setShortnessOfBreath(sob);
        p.setChestPain(false);

        p.setHeartRate(sob ? 108 : 82);
        p.setTemperature(fever ? 101.4 : 98.4);
        p.setWbc(fever ? 12500 : 8500);
        p.setOxygenSaturation(sob ? 91.0 : 97.0);
        p.setPainLevel(symptomCount(row) >= 3 ? 5 : 3);
        p.setSymptomDuration("Unknown (dataset)");

        p.setChiefComplaint(buildChiefComplaint(row));
        p.setArrivalTime(ARRIVAL_FMT.format(Instant.now()));
        p.setTriageNurseName(NURSE);
        p.setDepartmentNeeded("");
        p.setPriorityNote(NOTE);
        return p;
    }

    private static String buildChiefComplaint(DatasetRow row) {
        List<String> symptoms = new ArrayList<>();
        if (isYes(row.fever())) {
            symptoms.add("fever");
        }
        if (isYes(row.cough())) {
            symptoms.add("cough");
        }
        if (isYes(row.fatigue())) {
            symptoms.add("fatigue");
        }
        if (isYes(row.difficultyBreathing())) {
            symptoms.add("difficulty breathing");
        }
        String sx = symptoms.isEmpty() ? "no flagged symptoms" : String.join(", ", symptoms);
        String bp = row.bloodPressure().isBlank() ? "not recorded" : row.bloodPressure();
        String chol = row.cholesterol().isBlank() ? "not recorded" : row.cholesterol();
        return String.format(
                Locale.ROOT,
                "Dataset presentation: %s. Reported symptoms: %s. Blood pressure category: %s. Cholesterol: %s.",
                row.disease().isBlank() ? "Unknown condition" : row.disease(),
                sx,
                bp,
                chol
        );
    }

    private static int symptomCount(DatasetRow row) {
        int n = 0;
        if (isYes(row.fever())) {
            n++;
        }
        if (isYes(row.cough())) {
            n++;
        }
        if (isYes(row.fatigue())) {
            n++;
        }
        if (isYes(row.difficultyBreathing())) {
            n++;
        }
        return n;
    }

    private static boolean isYes(String value) {
        if (value == null) {
            return false;
        }
        return "yes".equalsIgnoreCase(value.trim());
    }

    private static String normalizeSex(String gender) {
        if (gender == null || gender.isBlank()) {
            return "Unknown";
        }
        String g = gender.trim();
        if (g.length() == 1) {
            return g.toUpperCase(Locale.ROOT);
        }
        return g.substring(0, 1).toUpperCase(Locale.ROOT) + g.substring(1).toLowerCase(Locale.ROOT);
    }
}
