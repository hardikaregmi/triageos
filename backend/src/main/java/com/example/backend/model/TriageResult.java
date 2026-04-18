package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TriageResult {

    private String risk;
    private String message;
    private String reasoning;
    private String confidence;
    private String assignedDoctor;

    /** ESI-style label from AI or rule-based enrichment (e.g. URGENT, LESS_URGENT). */
    private String priority;
    /** Primary clinical concern (mirrors message when from rules). */
    private String concern;
    private String recommendedAction;
    private String suggestedSpecialty;

    public TriageResult() {
    }

    public TriageResult(String risk, String message, String reasoning, String confidence, String assignedDoctor) {
        this.risk = risk;
        this.message = message;
        this.reasoning = reasoning;
        this.confidence = confidence;
        this.assignedDoctor = assignedDoctor;
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

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getConcern() {
        return concern;
    }

    public void setConcern(String concern) {
        this.concern = concern;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getSuggestedSpecialty() {
        return suggestedSpecialty;
    }

    public void setSuggestedSpecialty(String suggestedSpecialty) {
        this.suggestedSpecialty = suggestedSpecialty;
    }
}
