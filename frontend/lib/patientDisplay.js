/** Primary UI label for patients (privacy-first identifier). */
export function patientDisplayLabel(patient) {
  if (!patient) return "Patient";
  const explicitId = String(patient.patientIdentifier ?? "").trim();
  if (explicitId) return explicitId;

  // Backfill visual consistency for legacy records created before patientIdentifier existed.
  if (patient.id != null && Number.isFinite(Number(patient.id))) {
    const n = Number(patient.id);
    return `PT-${String(n).padStart(4, "0")}`;
  }
  return "PT-UNASSIGNED";
}
