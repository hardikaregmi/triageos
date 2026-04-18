import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useState } from "react";
import PatientIdentitySummary from "../components/PatientIdentitySummary";
import { NURSE_SESSION, isNurseLoggedIn } from "../constants/nurseSession";
import { patientDisplayLabel } from "../lib/patientDisplay";

const API_BASE = "http://localhost:8080";

function buildIntakePayload(form) {
  return {
    fullName: form.fullName,
    age: form.age === "" ? 0 : Number(form.age),
    sex: form.sex,
    roomNumber: form.roomNumber,
    heartRate: form.heartRate === "" ? 0 : Number(form.heartRate),
    temperature: form.temperature === "" ? 0 : Number(form.temperature),
    wbc: form.wbc === "" ? 0 : Number(form.wbc),
    bloodPressure: form.bloodPressure,
    oxygenSaturation: form.oxygenSaturation === "" ? 0 : Number(form.oxygenSaturation),
    chiefComplaint: form.chiefComplaint,
    symptomDuration: form.symptomDuration,
    painLevel: form.painLevel === "" ? 0 : Number(form.painLevel),
    fever: form.fever === "yes",
    shortnessOfBreath: form.shortnessOfBreath === "yes",
    chestPain: form.chestPain === "yes",
    arrivalTime: form.arrivalTime,
    triageNurseName: form.triageNurseName,
    departmentNeeded: form.departmentNeeded,
    priorityNote: form.priorityNote,
  };
}

const emptyIntakeForm = () => ({
  fullName: "",
  age: "",
  sex: "",
  roomNumber: "",
  heartRate: "",
  temperature: "",
  wbc: "",
  bloodPressure: "",
  oxygenSaturation: "",
  chiefComplaint: "",
  symptomDuration: "",
  painLevel: "",
  fever: "no",
  shortnessOfBreath: "no",
  chestPain: "no",
  arrivalTime: "",
  triageNurseName: "",
  departmentNeeded: "",
  priorityNote: "",
});

function priorityBadge(patient) {
  if (patient.risk == null) {
    return { label: "Medium", className: "medium" };
  }
  if (patient.risk === "HIGH") {
    return { label: "High", className: "high" };
  }
  return { label: "Low", className: "low" };
}

function initials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function availabilityLabel(status) {
  if (!status) return "—";
  const s = status.toLowerCase();
  if (s === "available") return "Available";
  if (s === "busy") return "Busy";
  if (s.includes("off")) return "Off duty";
  return status;
}

export default function DashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [summary, setSummary] = useState({
    totalPatients: 0,
    highRiskPatients: 0,
    availableDoctors: 0,
  });
  const [loadingMap, setLoadingMap] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [addingPatient, setAddingPatient] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeForm, setIntakeForm] = useState(emptyIntakeForm);
  const [expandedId, setExpandedId] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const loggedIn = isNurseLoggedIn();
    if (!loggedIn) {
      router.replace("/nurse-login");
      return;
    }
    try {
      const nurseName = localStorage.getItem(NURSE_SESSION.name);
      if (nurseName && nurseName.trim()) {
        setIntakeForm((prev) => ({ ...prev, triageNurseName: nurseName.trim() }));
      }
    } catch {
      /* ignore */
    }
    setSessionReady(true);
  }, [router]);

  useEffect(() => {
    if (!sessionReady) return;
    loadDashboard();
  }, [sessionReady]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!sessionReady) return;
    if (router.query.intake === "1") {
      setShowIntakeModal(true);
      router.replace("/dashboard", undefined, { shallow: true });
    }
  }, [router.isReady, router.query.intake, router, sessionReady]);

  async function loadDashboard() {
    setGlobalError("");
    try {
      const [patientsRes, summaryRes, doctorsRes] = await Promise.all([
        fetch(`${API_BASE}/patients`),
        fetch(`${API_BASE}/dashboard/summary`),
        fetch(`${API_BASE}/doctors`),
      ]);

      if (!patientsRes.ok || !summaryRes.ok || !doctorsRes.ok) {
        throw new Error("Failed request");
      }

      const [patientsData, summaryData, doctorsData] = await Promise.all([
        patientsRes.json(),
        summaryRes.json(),
        doctorsRes.json(),
      ]);

      setPatients(patientsData);
      setSummary(summaryData);
      setDoctors(doctorsData);
    } catch (err) {
      setGlobalError("Could not load dashboard data. Please try again.");
    }
  }

  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      const aHigh = a.risk === "HIGH" ? 1 : 0;
      const bHigh = b.risk === "HIGH" ? 1 : 0;
      return bHigh - aHigh;
    });
  }, [patients]);

  async function addPatient() {
    setAddingPatient(true);
    setGlobalError("");
    try {
      const response = await fetch(`${API_BASE}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildIntakePayload(intakeForm)),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setIntakeForm(emptyIntakeForm());
      setShowIntakeModal(false);
      await loadDashboard();
    } catch (err) {
      setGlobalError("Could not add patient. Please try again.");
    } finally {
      setAddingPatient(false);
    }
  }

  async function removePatient(patientId, e) {
    e.stopPropagation();
    setLoadingMap((prev) => ({ ...prev, [`remove-${patientId}`]: true }));
    setGlobalError("");
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      setExpandedId(null);
      await loadDashboard();
    } catch (err) {
      setGlobalError("Could not remove patient. Please try again.");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [`remove-${patientId}`]: false }));
    }
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="pageContainer">
      {globalError && <div className="errorStripLight">{globalError}</div>}

      <div className="medStatGrid">
        <article className="medStatCard medStatCardTextOnly">
          <div>
            <p className="medStatLabel">Total patients</p>
            <p className="medStatValue">{summary.totalPatients}</p>
            <p className="medStatHint">Current queue</p>
          </div>
        </article>

        <article className="medStatCard medStatCardTextOnly">
          <div>
            <p className="medStatLabel">High priority</p>
            <p className={`medStatValue ${summary.highRiskPatients > 0 ? "alert" : ""}`}>{summary.highRiskPatients}</p>
            <p className="medStatHint">Flagged after triage</p>
          </div>
        </article>

        <article className="medStatCard medStatCardTextOnly">
          <div>
            <p className="medStatLabel">Doctors on duty</p>
            <p className="medStatValue">{summary.availableDoctors}</p>
            <p className="medStatHint">Available now</p>
          </div>
        </article>

        <article className="medStatCard medStatCardTextOnly">
          <div>
            <p className="medStatLabel">Average wait time</p>
            <p className="medStatValue">—</p>
            <p className="medStatHint">Not recorded</p>
          </div>
        </article>
      </div>

      <div className="medSplit">
        <div>
          <div className="medCard panelPaddingLg dashToolbar">
            <div className="queueToolbarRow">
              <div className="queueTitleBlock">
                <div className="queueTitleRow">
                  <h2 className="medPanelTitle" style={{ margin: 0 }}>
                    Patient triage queue
                  </h2>
                  {summary.highRiskPatients > 0 && (
                    <span className="queuePriorityBadge">{summary.highRiskPatients} high priority</span>
                  )}
                </div>
                <p className="medPanelHint dashToolbarHint" style={{ margin: 0 }}>
                  Select a row to expand intake notes and triage output
                </p>
              </div>
              <div className="queueToolbarActions">
                <Link href="/doctors" className="medLinkQuiet">
                  Available doctors
                </Link>
                <button type="button" className="primaryButton" onClick={() => setShowIntakeModal(true)}>
                  + New patient
                </button>
              </div>
            </div>
          </div>

          <div className="medTableWrap">
            <table className="medTable">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                  <th>Time</th>
                  <th style={{ minWidth: 168 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPatients.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                      No patients in queue. Add a new intake to begin.
                    </td>
                  </tr>
                )}
                {sortedPatients.map((patient) => {
                  const displayName = patientDisplayLabel(patient);
                  const badge = priorityBadge(patient);
                  const triaged = patient.risk != null;
                  const isOpen = expandedId === patient.id;
                  return (
                    <Fragment key={patient.id}>
                      <tr
                        onClick={() => toggleExpand(patient.id)}
                        style={{ cursor: "pointer" }}
                        title={`Details for ${displayName}`}
                      >
                        <td>
                          <PatientIdentitySummary patient={patient} />
                          <div className="tableMuted">
                            {patient.chiefComplaint
                              ? patient.chiefComplaint.slice(0, 44) + (patient.chiefComplaint.length > 44 ? "…" : "")
                              : "—"}
                          </div>
                        </td>
                        <td style={{ fontVariantNumeric: "tabular-nums" }}>{patient.age != null ? patient.age : "—"}</td>
                        <td>
                          <span className={`statusPillBadge ${badge.className}`}>{badge.label}</span>
                        </td>
                        <td>
                          <span className="statusWithDot">
                            <span className={`statusDotInline ${triaged ? "ready" : "waiting"}`} aria-hidden />
                            {triaged ? "Triaged" : "Waiting"}
                          </span>
                        </td>
                        <td>{patient.assignedDoctor || "—"}</td>
                        <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>
                          {patient.arrivalTime || "—"}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="medTableActions">
                            <button
                              type="button"
                              className="btnSm btnSmDanger"
                              onClick={(e) => removePatient(patient.id, e)}
                              disabled={!!loadingMap[`remove-${patient.id}`]}
                            >
                              {loadingMap[`remove-${patient.id}`] ? "…" : "Remove"}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="medTableDetail">
                          <td colSpan={7}>
                            <div style={{ padding: 16, fontSize: 13 }}>
                              <PatientIdentitySummary patient={patient} />
                              <p style={{ margin: "12px 0 10px", fontWeight: 600, color: "var(--text-muted)" }}>
                                Intake & vitals
                              </p>
                              <p style={{ margin: "0 0 8px", color: "var(--text)" }}>
                                Age {patient.age} · {patient.sex || "—"} · Dept {patient.departmentNeeded || "—"} · Nurse{" "}
                                {patient.triageNurseName || "—"}
                              </p>
                              <p style={{ margin: "0 0 8px", color: "var(--text-muted)" }}>
                                HR {patient.heartRate} · Temp {patient.temperature}°F · WBC {patient.wbc} · BP{" "}
                                {patient.bloodPressure || "—"} · SpO₂ {patient.oxygenSaturation}%
                              </p>
                              {triaged && (
                                <>
                                  <p style={{ margin: "14px 0 8px", fontWeight: 600, color: "var(--text-muted)" }}>
                                    Triage result
                                  </p>
                                  <dl
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "140px 1fr",
                                      gap: "6px 12px",
                                      margin: 0,
                                      color: "var(--text)",
                                    }}
                                  >
                                    <dt style={{ color: "var(--text-hint)" }}>Priority</dt>
                                    <dd style={{ margin: 0 }}>{patient.priority ?? "—"}</dd>
                                    <dt style={{ color: "var(--text-hint)" }}>Concern</dt>
                                    <dd style={{ margin: 0 }}>{patient.concern ?? patient.message ?? "—"}</dd>
                                    <dt style={{ color: "var(--text-hint)" }}>Reasoning</dt>
                                    <dd style={{ margin: 0 }}>{patient.reasoning ?? "—"}</dd>
                                    <dt style={{ color: "var(--text-hint)" }}>Recommended action</dt>
                                    <dd style={{ margin: 0 }}>{patient.recommendedAction ?? "—"}</dd>
                                    <dt style={{ color: "var(--text-hint)" }}>Suggested specialty</dt>
                                    <dd style={{ margin: 0 }}>{patient.suggestedSpecialty ?? "—"}</dd>
                                    <dt style={{ color: "var(--text-hint)" }}>Confidence</dt>
                                    <dd style={{ margin: 0 }}>{patient.confidence ?? "—"}</dd>
                                    <dt style={{ color: "var(--text-hint)" }}>Assigned doctor</dt>
                                    <dd style={{ margin: 0 }}>{patient.assignedDoctor ?? "—"}</dd>
                                  </dl>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="medCard panelPaddingLg">
          <div className="dashPanelHead">
            <div>
              <h2 className="medPanelTitle" style={{ margin: 0 }}>
                Doctors on duty
              </h2>
            </div>
            <Link href="/doctors" className="medLinkQuiet">
              View all
            </Link>
          </div>
          <div className="medDoctorList">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="medDoctorRow">
                <div className="medDoctorAvatar" aria-hidden>
                  {initials(doctor.name)}
                </div>
                <div className="medDoctorInfo">
                  <p className="medDoctorName">{doctor.name}</p>
                  <p className="medDoctorSpec">{doctor.specialty}</p>
                </div>
                <div>
                  <span
                    className={`statusPillBadge ${
                      doctor.status === "available" ? "available" : doctor.status === "busy" ? "busy" : "offshift"
                    }`}
                  >
                    {doctor.status}
                  </span>
                  <div className="medDoctorMeta">{availabilityLabel(doctor.status)}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {showIntakeModal && (
        <div className="modalOverlayLight" role="dialog" aria-modal="true" aria-labelledby="intake-title">
          <div className="medCard modalCardLight">
            <div className="sectionHeader">
              <p className="sectionLabel" id="intake-title">
                Patient intake
              </p>
              <button type="button" className="btnSm" onClick={() => setShowIntakeModal(false)}>
                Close
              </button>
            </div>

            <div className="formSection sectionContainer" style={{ marginBottom: 12 }}>
              <p className="sectionLabel">Identity</p>
              <div
                className="formGrid"
                style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}
              >
                <label>
                  Full name
                  <input
                    className="uiInput"
                    value={intakeForm.fullName}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  />
                </label>
                <label>
                  Age
                  <input
                    className="uiInput"
                    type="number"
                    value={intakeForm.age}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, age: e.target.value }))}
                  />
                </label>
                <label>
                  Sex
                  <select
                    className="uiSelect"
                    value={intakeForm.sex}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, sex: e.target.value }))}
                  >
                    <option value="">Select</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  Room number
                  <input
                    className="uiInput"
                    value={intakeForm.roomNumber}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, roomNumber: e.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div className="formSection sectionContainer" style={{ marginBottom: 12 }}>
              <p className="sectionLabel">Vital signs</p>
              <div
                className="formGrid"
                style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}
              >
                <label>
                  Heart rate
                  <input
                    className="uiInput"
                    type="number"
                    value={intakeForm.heartRate}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, heartRate: e.target.value }))}
                  />
                </label>
                <label>
                  Temperature
                  <input
                    className="uiInput"
                    type="number"
                    step="0.1"
                    value={intakeForm.temperature}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, temperature: e.target.value }))}
                  />
                </label>
                <label>
                  WBC
                  <input
                    className="uiInput"
                    type="number"
                    value={intakeForm.wbc}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, wbc: e.target.value }))}
                  />
                </label>
                <label>
                  Blood pressure
                  <input
                    className="uiInput"
                    value={intakeForm.bloodPressure}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, bloodPressure: e.target.value }))}
                  />
                </label>
                <label style={{ gridColumn: "span 2" }}>
                  Oxygen saturation
                  <input
                    className="uiInput"
                    type="number"
                    value={intakeForm.oxygenSaturation}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, oxygenSaturation: e.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div className="formSection sectionContainer" style={{ marginBottom: 16 }}>
              <p className="sectionLabel">Clinical notes</p>
              <div
                className="formGrid"
                style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}
              >
                <label>
                  Chief complaint
                  <input
                    className="uiInput"
                    value={intakeForm.chiefComplaint}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
                  />
                </label>
                <label>
                  Symptom duration
                  <input
                    className="uiInput"
                    value={intakeForm.symptomDuration}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, symptomDuration: e.target.value }))}
                  />
                </label>
                <label>
                  Pain level
                  <input
                    className="uiInput"
                    type="number"
                    min="0"
                    max="10"
                    value={intakeForm.painLevel}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, painLevel: e.target.value }))}
                  />
                </label>
                <label>
                  Fever
                  <select
                    className="uiSelect"
                    value={intakeForm.fever}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, fever: e.target.value }))}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label>
                  Shortness of breath
                  <select
                    className="uiSelect"
                    value={intakeForm.shortnessOfBreath}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, shortnessOfBreath: e.target.value }))}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label>
                  Chest pain
                  <select
                    className="uiSelect"
                    value={intakeForm.chestPain}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, chestPain: e.target.value }))}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label>
                  Arrival time
                  <input
                    className="uiInput"
                    value={intakeForm.arrivalTime}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, arrivalTime: e.target.value }))}
                  />
                </label>
                <label>
                  Triage nurse
                  <input
                    className="uiInput"
                    value={intakeForm.triageNurseName}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, triageNurseName: e.target.value }))}
                  />
                </label>
                <label>
                  Department
                  <input
                    className="uiInput"
                    value={intakeForm.departmentNeeded}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, departmentNeeded: e.target.value }))}
                  />
                </label>
                <label style={{ gridColumn: "span 2" }}>
                  Priority note
                  <textarea
                    className="uiTextarea"
                    value={intakeForm.priorityNote}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, priorityNote: e.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btnSm" onClick={() => setShowIntakeModal(false)}>
                Cancel
              </button>
              <button type="button" className="primaryButton" onClick={addPatient} disabled={addingPatient}>
                {addingPatient ? "Saving…" : "Save patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
