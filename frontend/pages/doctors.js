import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function DoctorsPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorStatusOverrides, setDoctorStatusOverrides] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setError("");
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        fetch(`${API_BASE}/patients`),
        fetch(`${API_BASE}/doctors`),
      ]);
      if (!patientsRes.ok || !doctorsRes.ok) {
        throw new Error("Failed request");
      }

      const [patientsData, doctorsData] = await Promise.all([patientsRes.json(), doctorsRes.json()]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      setError("Could not load doctor data. Please try again.");
    }
  }

  const effectiveDoctors = useMemo(() => {
    return doctors.map((doctor) => ({
      ...doctor,
      status: doctorStatusOverrides[doctor.id] || doctor.status,
    }));
  }, [doctors, doctorStatusOverrides]);

  function preferredDoctorsForPatient(patient) {
    if (patient.message === "Severe infection risk" || patient.message === "Possible early sepsis risk") {
      return ["Dr. Nguyen", "Dr. Patel"];
    }
    if (patient.message === "Cardiac stress risk") {
      return ["Dr. Carter", "Dr. Patel"];
    }
    return ["Dr. Patel", "Dr. Smith"];
  }

  function getAssignedDoctorName(patient) {
    const available = effectiveDoctors.filter((doctor) => doctor.status === "available");
    const preferred = preferredDoctorsForPatient(patient);
    const preferredAvailable = preferred.find((doctorName) =>
      available.some((doctor) => doctor.name === doctorName)
    );
    if (preferredAvailable) return preferredAvailable;

    const currentlyAssigned = effectiveDoctors.find(
      (doctor) => doctor.name === patient.assignedDoctor && doctor.status === "available"
    );
    if (currentlyAssigned) return currentlyAssigned.name;

    return available[0]?.name || patient.assignedDoctor;
  }

  function patientsForDoctor(doctorName) {
    return patients.filter((patient) => getAssignedDoctorName(patient) === doctorName);
  }

  function updateDoctorStatus(doctorId, status) {
    setDoctorStatusOverrides((prev) => ({ ...prev, [doctorId]: status }));
  }

  function initials(name) {
    if (!name) return "?";
    const p = name.trim().split(/\s+/);
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }

  return (
    <div className="pageContainer">
      {error && <div className="errorStripLight">{error}</div>}

      <section className="medCard panelPaddingLg">
        <h2 className="medPanelTitle">Physician roster</h2>
        <p className="medPanelHint">Status selection is local preview only for this browser session.</p>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 14,
          }}
          className="doctorPageGrid"
        >
          {effectiveDoctors.map((doctor) => {
            const assigned = patientsForDoctor(doctor.name);
            return (
              <article key={doctor.id} className="surfaceCard" style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div className="medDoctorAvatar">{initials(doctor.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{doctor.name}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{doctor.specialty}</p>
                    <p style={{ margin: "10px 0 0" }}>
                      <span
                        className={`statusPillBadge ${
                          doctor.status === "available" ? "available" : doctor.status === "busy" ? "busy" : "offshift"
                        }`}
                      >
                        {doctor.status}
                      </span>
                    </p>
                    <div style={{ marginTop: 12 }}>
                      <label
                        htmlFor={`doctor-status-${doctor.id}`}
                        style={{ fontSize: 11, fontWeight: 600, color: "var(--text-hint)", display: "block", marginBottom: 6 }}
                      >
                        Status
                      </label>
                      <select
                        className="uiSelect"
                        id={`doctor-status-${doctor.id}`}
                        value={doctor.status}
                        onChange={(e) => updateDoctorStatus(doctor.id, e.target.value)}
                        style={{ width: "100%", maxWidth: 220 }}
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="off shift">Off shift</option>
                      </select>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "var(--text-hint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Assigned patients
                      </p>
                      {assigned.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text-hint)" }}>None</p>
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--text-muted)" }}>
                          {assigned.map((patient) => (
                            <li key={patient.id}>{patient.name ?? patient.fullName}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 800px) {
          .doctorPageGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
