import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PatientIdentitySummary from "../components/PatientIdentitySummary";
import { API_BASE, authHeaders, handleUnauthorized } from "../lib/api";

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
    } catch (err) {
      setError("Could not load doctor data. Please try again.");
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
