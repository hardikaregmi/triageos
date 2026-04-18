import { patientDisplayLabel } from "../lib/patientDisplay";

/**
 * Shared patient row identity: identifier, room, dataset import line (dashboard / roster).
 */
export default function PatientIdentitySummary({ patient }) {
  const label = patientDisplayLabel(patient);
  const storedName = String(patient?.fullName ?? "").trim();
  const showSecondaryName =
    storedName.length > 0 && storedName !== label && storedName.toLowerCase() !== "imported dataset case";
  return (
    <>
      <div className="patientCellName">{label}</div>
      {showSecondaryName && <div className="patientCellSecondaryName">{storedName}</div>}
      {patient.roomNumber && <div className="patientCellRoom">Room {patient.roomNumber}</div>}
      {patient.importedFromDataset && <div className="patientCellImport">Imported dataset case</div>}
    </>
  );
}
