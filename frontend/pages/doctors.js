import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PatientIdentitySummary from "../components/PatientIdentitySummary";
import { API_BASE, authHeaders, handleUnauthorized } from "../lib/api";

function formatAlertTimestamp(iso) {
  if (iso == null || iso === "") return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export default function DoctorsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newStatus, setNewStatus] = useState("available");
  const [addBusy, setAddBusy] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState(null);
  const [doctorAlertGroups, setDoctorAlertGroups] = useState([]);
  const [ackBusyId, setAckBusyId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setError("");
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        fetch(`${API_BASE}/patients`, { headers: authHeaders(false) }),
        fetch(`${API_BASE}/doctors`, { headers: authHeaders(false) }),
      ]);
      if (handleUnauthorized(patientsRes, router) || handleUnauthorized(doctorsRes, router)) {
        return;
      }
      if (!patientsRes.ok || !doctorsRes.ok) {
        throw new Error("Failed request");
      }

      const [patientsData, doctorsData] = await Promise.all([patientsRes.json(), doctorsRes.json()]);
      setPatients(patientsData);
      setDoctors(doctorsData);

      const alertGroups = await Promise.all(
        doctorsData.map(async (d) => {
          const ar = await fetch(`${API_BASE}/doctors/${d.id}/alerts`, { headers: authHeaders(false) });
          if (handleUnauthorized(ar, router)) {
            return { doctor: d, alerts: [] };
          }
          const list = ar.ok ? await ar.json() : [];
          return { doctor: d, alerts: Array.isArray(list) ? list : [] };
        })
      );
      setDoctorAlertGroups(alertGroups);
    } catch (err) {
      setError("Could not load doctor data. Please try again.");
    }
  }

  async function acknowledgeAlert(alertId) {
    setAckBusyId(alertId);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
        method: "PATCH",
        headers: authHeaders(false),
      });
      if (handleUnauthorized(response, router)) {
        return;
      }
      if (!response.ok) {
        throw new Error("Failed");
      }
      await loadData();
    } catch (err) {
      setError("Could not update alert. Please try again.");
    } finally {
      setAckBusyId(null);
    }
  }

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
    const available = doctors.filter((doctor) => doctor.status === "available");
    const preferred = preferredDoctorsForPatient(patient);
    const preferredAvailable = preferred.find((doctorName) =>
      available.some((doctor) => doctor.name === doctorName)
    );
    if (preferredAvailable) return preferredAvailable;

    const currentlyAssigned = doctors.find(
      (doctor) => doctor.name === patient.assignedDoctor && doctor.status === "available"
    );
    if (currentlyAssigned) return currentlyAssigned.name;

    return available[0]?.name || patient.assignedDoctor;
  }

  function patientsForDoctor(doctorName) {
    return patients.filter((patient) => getAssignedDoctorName(patient) === doctorName);
  }

  async function refreshDoctorAndSummaryData() {
    const [doctorsRes, summaryRes] = await Promise.all([
      fetch(`${API_BASE}/doctors`, { headers: authHeaders(false) }),
      fetch(`${API_BASE}/dashboard/summary`, { headers: authHeaders(false) }),
    ]);
    if (handleUnauthorized(doctorsRes, router) || handleUnauthorized(summaryRes, router)) {
      return;
    }
    if (!doctorsRes.ok || !summaryRes.ok) {
      throw new Error("Failed request");
    }
    const doctorsData = await doctorsRes.json();
    setDoctors(doctorsData);
  }

  async function updateDoctorStatus(doctorId, status) {
    setError("");
    try {
      const response = await fetch(`${API_BASE}/doctors/${doctorId}/status`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ status }),
      });
      if (handleUnauthorized(response, router)) {
        return;
      }
      if (!response.ok) {
        throw new Error("Request failed");
      }
      await refreshDoctorAndSummaryData();
    } catch (err) {
      setError("Could not update doctor status. Please try again.");
    }
  }

  async function addDoctor(e) {
    e.preventDefault();
    const name = newName.trim();
    const specialty = newSpecialty.trim();
    if (!name || !specialty) {
      setError("Enter a name and specialty to add a physician.");
      return;
    }
    setError("");
    setAddBusy(true);
    try {
      const response = await fetch(`${API_BASE}/doctors`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ name, specialty, status: newStatus }),
      });
      if (handleUnauthorized(response, router)) {
        return;
      }
      if (response.status === 400) {
        setError("Name and specialty are required.");
        return;
      }
      if (!response.ok) {
        throw new Error("Request failed");
      }
      setNewName("");
      setNewSpecialty("");
      setNewStatus("available");
      await refreshDoctorAndSummaryData();
    } catch (err) {
      setError("Could not add physician. Please try again.");
    } finally {
      setAddBusy(false);
    }
  }

  async function removeDoctor(doctor) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Remove ${doctor.name} from the roster? They will no longer appear for assignments.`)
    ) {
      return;
    }
    setError("");
    setDeleteBusyId(doctor.id);
    try {
      const response = await fetch(`${API_BASE}/doctors/${doctor.id}`, {
        method: "DELETE",
        headers: authHeaders(false),
      });
      if (handleUnauthorized(response, router)) {
        return;
      }
      if (response.status === 404) {
        setError("That physician is no longer on the roster.");
        await refreshDoctorAndSummaryData();
        return;
      }
      if (!response.ok) {
        throw new Error("Request failed");
      }
      await refreshDoctorAndSummaryData();
    } catch (err) {
      setError("Could not remove physician. Please try again.");
    } finally {
      setDeleteBusyId(null);
    }
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

      <section className="medCard panelPaddingLg" style={{ marginBottom: 16 }}>
        <h2 className="medPanelTitle" style={{ margin: "0 0 4px" }}>
          Add a physician
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--text-muted)", maxWidth: 560 }}>
          When someone joins the department, add them here so they appear in availability and triage routing.
        </p>
        <form onSubmit={addDoctor} style={{ display: "grid", gap: 12, maxWidth: 480 }}>
          <div>
            <label htmlFor="new-doctor-name" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-hint)", display: "block", marginBottom: 6 }}>
              Name
            </label>
            <input
              id="new-doctor-name"
              className="uiInput"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Dr. Rivera"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="new-doctor-specialty" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-hint)", display: "block", marginBottom: 6 }}>
              Specialty
            </label>
            <input
              id="new-doctor-specialty"
              className="uiInput"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              placeholder="e.g. Pulmonology"
            />
          </div>
          <div>
            <label htmlFor="new-doctor-status" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-hint)", display: "block", marginBottom: 6 }}>
              Initial status
            </label>
            <select id="new-doctor-status" className="uiSelect" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ maxWidth: 280 }}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="off shift">Off shift</option>
            </select>
          </div>
          <div>
            <button type="submit" className="btnSm btnSmPrimary" disabled={addBusy}>
              {addBusy ? "Adding…" : "Add to roster"}
            </button>
          </div>
        </form>
      </section>

      <section className="medCard panelPaddingLg" style={{ marginBottom: 16 }}>
        <h2 className="medPanelTitle" style={{ margin: "0 0 4px" }}>
          Physician alerts
        </h2>
        <p style={{ margin: "0 0 14px", fontSize: 14, color: "var(--text-muted)", maxWidth: 640 }}>
          Internal escalations from nurses. Acknowledge after review.
        </p>
        {doctorAlertGroups.reduce((n, g) => n + g.alerts.length, 0) === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-hint)" }}>No alerts yet.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {doctorAlertGroups.flatMap(({ doctor, alerts }) =>
              alerts.map((a) => (
                <li
                  key={a.id}
                  style={{
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    background: a.status === "UNREAD" ? "var(--accent-soft)" : "var(--bg-elevated)",
                    padding: "10px 12px",
                    borderLeft: a.status === "UNREAD" ? "3px solid var(--accent)" : "3px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{doctor.name}</span>
                      {a.status === "UNREAD" && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            color: "var(--accent)",
                            fontWeight: 600,
                          }}
                        >
                          Unread
                        </span>
                      )}
                    </div>
                    <span className={`statusPillBadge ${a.priority === "HIGH" ? "high" : "medium"}`}>{a.priority}</span>
                  </div>
                  <p style={{ margin: "8px 0 4px", fontSize: 13, color: "var(--text)", lineHeight: 1.45 }}>{a.message}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
                    Patient #{a.patientId} · Nurse {a.nurseId} · {formatAlertTimestamp(a.createdAt)}
                  </p>
                  {a.status === "UNREAD" && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        className="btnSm"
                        disabled={ackBusyId === a.id}
                        onClick={() => void acknowledgeAlert(a.id)}
                      >
                        {ackBusyId === a.id ? "…" : "Acknowledge"}
                      </button>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      <section className="medCard panelPaddingLg">
        <h2 className="medPanelTitle" style={{ margin: "0 0 12px" }}>
          Current roster
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 14,
          }}
          className="doctorPageGrid"
        >
          {doctors.map((doctor) => {
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
                        onChange={(e) => void updateDoctorStatus(doctor.id, e.target.value)}
                        style={{ width: "100%", maxWidth: 220 }}
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="off shift">Off shift</option>
                      </select>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <button
                        type="button"
                        className="btnSm btnSmDanger"
                        disabled={deleteBusyId === doctor.id}
                        onClick={() => void removeDoctor(doctor)}
                      >
                        {deleteBusyId === doctor.id ? "Removing…" : "Remove from roster"}
                      </button>
                      <p
                        style={{
                          margin: "14px 0 6px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-hint)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Assigned patients
                      </p>
                      {assigned.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text-hint)" }}>None</p>
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--text-muted)" }}>
                          {assigned.map((patient) => (
                            <li key={patient.id}>
                              <PatientIdentitySummary patient={patient} />
                            </li>
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
