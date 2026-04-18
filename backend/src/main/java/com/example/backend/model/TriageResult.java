package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Embeddable
public class TriageResult {

    @Column(name = "triage_risk")
    private String risk;

    @Column(name = "triage_message")
    private String message;

    @Column(name = "triage_reasoning")
    private String reasoning;

    @Column(name = "triage_confidence")
    private String confidence;

    @Column(name = "triage_assigned_doctor")
    private String assignedDoctor;

    @Column(name = "triage_priority")
    private String priority;

    @Column(name = "triage_concern")
    private String concern;

    @Column(name = "triage_recommended_action")
    private String recommendedAction;

    @Column(name = "triage_suggested_specialty")
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
