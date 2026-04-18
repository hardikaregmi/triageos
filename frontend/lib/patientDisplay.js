/** Primary UI label for patients (privacy-first identifier: server-generated patientCode). */
export function patientDisplayLabel(patient) {
  if (!patient) return "Patient";
  const code = String(patient.patientCode ?? patient.patientIdentifier ?? "").trim();
  if (code) return code;

  // Backfill for legacy or missing code
  if (patient.id != null && Number.isFinite(Number(patient.id))) {
    const n = Number(patient.id);
    return `PT-${String(n).padStart(4, "0")}`;
  }
  return "PT-UNASSIGNED";
}
