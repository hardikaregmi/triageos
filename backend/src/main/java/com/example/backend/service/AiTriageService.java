package com.example.backend.service;

import com.example.backend.model.Doctor;
import com.example.backend.model.Patient;
import com.example.backend.model.TriageResult;
import com.example.backend.repository.DoctorRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class AiTriageService {

    private static final Logger log = LoggerFactory.getLogger(AiTriageService.class);
    private static final URI OPENAI_CHAT = URI.create("https://api.openai.com/v1/chat/completions");

    private final ObjectMapper objectMapper;
    private final DoctorRepository doctorRepository;
    private final HttpClient httpClient;

    @Value("${OPENAI_API_KEY:}")
    private String apiKey;

    @Value("${OPENAI_MODEL:gpt-4o-mini}")
    private String model;

    public AiTriageService(ObjectMapper objectMapper, DoctorRepository doctorRepository) {
        this.objectMapper = objectMapper;
        this.doctorRepository = doctorRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    /**
     * Runs AI triage. Returns {@code null} if the API is not configured or the call fails — caller should use rule-based fallback.
     */
    public TriageResult assess(Patient patient) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }
        try {
            String prompt = buildPrompt(patient);
            String json = requestStructuredJson(prompt);
            AiStructuredResponse parsed = objectMapper.readValue(json, AiStructuredResponse.class);
            return toTriageResult(parsed, doctorRepository.findAll());
        } catch (Exception e) {
            log.warn("AI triage failed, fallback will be used: {}", e.getMessage());
            return null;
        }
    }

    private String buildPrompt(Patient p) {
        return """
                You are an emergency department triage assistant. Given the following structured intake, assess clinical urgency.

                Respond with ONLY valid JSON (no markdown, no code fences) matching exactly this shape:
                {"priority":"<string>","concern":"<string>","reasoning":"<string>","recommendedAction":"<string>","suggestedSpecialty":"<string>","confidence":"<string>"}

                Field rules:
                - priority: one of EMERGENT, URGENT, LESS_URGENT, NON_URGENT (clinical acuity).
                - concern: short primary clinical concern (one sentence).
                - reasoning: brief explanation referencing vitals and symptoms.
                - recommendedAction: concrete next step (e.g. immediate provider, monitoring, labs).
                - suggestedSpecialty: best-matching specialty label (e.g. Emergency Medicine, Cardiology, Internal Medicine, General Practice).
                - confidence: estimated certainty as a percentage string (e.g. "85%").

                Patient intake:
                """
                + "- fullName: " + nullSafe(p.getFullName()) + "\n"
                + "- age: " + p.getAge() + "\n"
                + "- sex: " + nullSafe(p.getSex()) + "\n"
                + "- roomNumber: " + nullSafe(p.getRoomNumber()) + "\n"
                + "- heartRate: " + p.getHeartRate() + "\n"
                + "- temperature: " + p.getTemperature() + "\n"
                + "- wbc: " + p.getWbc() + "\n"
                + "- bloodPressure: " + nullSafe(p.getBloodPressure()) + "\n"
                + "- oxygenSaturation: " + p.getOxygenSaturation() + "\n"
                + "- chiefComplaint: " + nullSafe(p.getChiefComplaint()) + "\n"
                + "- symptomDuration: " + nullSafe(p.getSymptomDuration()) + "\n"
                + "- painLevel: " + p.getPainLevel() + "/10\n"
                + "- fever: " + p.isFever() + "\n"
                + "- shortnessOfBreath: " + p.isShortnessOfBreath() + "\n"
                + "- chestPain: " + p.isChestPain() + "\n"
                + "- arrivalTime: " + nullSafe(p.getArrivalTime()) + "\n"
                + "- triageNurseName: " + nullSafe(p.getTriageNurseName()) + "\n"
                + "- departmentNeeded: " + nullSafe(p.getDepartmentNeeded()) + "\n"
                + "- priorityNote: " + nullSafe(p.getPriorityNote()) + "\n";
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }

    private String requestStructuredJson(String userPrompt) throws Exception {
        String body = objectMapper.writeValueAsString(new OpenAiChatRequest(
                model,
                List.of(new OpenAiChatMessage("user", userPrompt)),
                new ResponseFormat("json_object")
        ));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(OPENAI_CHAT)
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("OpenAI HTTP " + response.statusCode() + ": " + response.body());
        }

        OpenAiChatResponse chat = objectMapper.readValue(response.body(), OpenAiChatResponse.class);
        String content = chat.choices().get(0).message().content();
        return stripMarkdownFence(content);
    }

    private static String stripMarkdownFence(String raw) {
        if (raw == null) {
            return "";
        }
        String s = raw.trim();
        if (s.startsWith("```")) {
            int start = s.indexOf('\n');
            int end = s.lastIndexOf("```");
            if (start > 0 && end > start) {
                s = s.substring(start + 1, end).trim();
            }
        }
        return s;
    }

    private TriageResult toTriageResult(AiStructuredResponse ai, List<Doctor> doctors) {
        String risk = priorityToRisk(ai.priority());
        String message = blankToDefault(ai.concern(), "Assessment complete");
        String reasoningOnly = blankToDefault(ai.reasoning(), "No additional reasoning provided.");
        String recommendedAction = ai.recommendedAction() != null ? ai.recommendedAction().trim() : "";
        String confidence = normalizeConfidence(ai.confidence());
        String assigned = pickDoctorBySpecialty(ai.suggestedSpecialty(), doctors);
        TriageResult result = new TriageResult(risk, message, reasoningOnly, confidence, assigned);
        String priorityLabel = (ai.priority() != null && !ai.priority().isBlank())
                ? ai.priority().trim()
                : ("HIGH".equals(risk) ? "URGENT" : "LESS_URGENT");
        result.setPriority(priorityLabel);
        result.setConcern(blankToDefault(ai.concern(), message));
        result.setRecommendedAction(recommendedAction.isEmpty() ? null : recommendedAction);
        result.setSuggestedSpecialty(
                ai.suggestedSpecialty() != null && !ai.suggestedSpecialty().isBlank() ? ai.suggestedSpecialty().trim() : null);
        return result;
    }

    private static String priorityToRisk(String priority) {
        if (priority == null || priority.isBlank()) {
            return "LOW";
        }
        String p = priority.trim().toUpperCase(Locale.ROOT);
        if (p.contains("EMERGENT")) {
            return "HIGH";
        }
        if (p.contains("LESS") || p.contains("NON")) {
            return "LOW";
        }
        if (p.contains("URGENT")) {
            return "HIGH";
        }
        return "LOW";
    }

    private static String normalizeConfidence(String confidence) {
        if (confidence == null || confidence.isBlank()) {
            return "—";
        }
        String c = confidence.trim();
        return c.contains("%") ? c : c + "%";
    }

    private static String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String pickDoctorBySpecialty(String suggestedSpecialty, List<Doctor> doctors) {
        if (suggestedSpecialty == null || suggestedSpecialty.isBlank()) {
            return firstAvailableOrFirst(doctors);
        }
        String hint = suggestedSpecialty.toLowerCase(Locale.ROOT);
        Optional<Doctor> matched = doctors.stream()
                .filter(d -> "available".equalsIgnoreCase(d.getStatus()))
                .filter(d -> specialtyMatches(hint, d.getSpecialty()))
                .findFirst();
        if (matched.isPresent()) {
            return matched.get().getName();
        }
        return firstAvailableOrFirst(doctors);
    }

    private static boolean specialtyMatches(String hint, String doctorSpecialty) {
        if (doctorSpecialty == null || doctorSpecialty.isBlank()) {
            return false;
        }
        String spec = doctorSpecialty.toLowerCase(Locale.ROOT);
        return hint.contains(spec) || spec.contains(hint);
    }

    private static String firstAvailableOrFirst(List<Doctor> doctors) {
        return doctors.stream()
                .filter(d -> "available".equalsIgnoreCase(d.getStatus()))
                .map(Doctor::getName)
                .findFirst()
                .orElseGet(() -> doctors.isEmpty() ? null : doctors.get(0).getName());
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AiStructuredResponse(
            String priority,
            String concern,
            String reasoning,
            String recommendedAction,
            String suggestedSpecialty,
            String confidence
    ) {
    }

    private record OpenAiChatRequest(
            String model,
            List<OpenAiChatMessage> messages,
            @JsonProperty("response_format") ResponseFormat responseFormat
    ) {
    }

    private record OpenAiChatMessage(String role, String content) {
    }

    private record ResponseFormat(String type) {
    }

    private record OpenAiChatResponse(List<OpenAiChoice> choices) {
    }

    private record OpenAiChoice(AssistantMessage message) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AssistantMessage(String content) {
    }
}
