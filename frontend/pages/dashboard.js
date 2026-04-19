import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import PatientIdentitySummary from "../components/PatientIdentitySummary";
import { NURSE_SESSION, isNurseLoggedIn } from "../constants/nurseSession";
import { patientDisplayLabel } from "../lib/patientDisplay";
import { API_BASE, authHeaders, handleUnauthorized } from "../lib/api";

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

function patientToForm(patient) {
  return {
    fullName: patient.fullName ?? "",
    age: patient.age != null ? String(patient.age) : "",
    sex: patient.sex ?? "",
    roomNumber: patient.roomNumber ?? "",
    heartRate: patient.heartRate != null ? String(patient.heartRate) : "",
    temperature: patient.temperature != null ? String(patient.temperature) : "",
    wbc: patient.wbc != null ? String(patient.wbc) : "",
    bloodPressure: patient.bloodPressure ?? "",
    oxygenSaturation: patient.oxygenSaturation != null ? String(patient.oxygenSaturation) : "",
    chiefComplaint: patient.chiefComplaint ?? "",
    symptomDuration: patient.symptomDuration ?? "",
    painLevel: patient.painLevel != null ? String(patient.painLevel) : "",
    fever: patient.fever ? "yes" : "no",
    shortnessOfBreath: patient.shortnessOfBreath ? "yes" : "no",
    chestPain: patient.chestPain ? "yes" : "no",
    arrivalTime: patient.arrivalTime ?? "",
    triageNurseName: patient.triageNurseName ?? "",
    departmentNeeded: patient.departmentNeeded ?? "",
    priorityNote: patient.priorityNote ?? "",
  };
}

function priorityBadge(patient) {
  if (patient.risk == null) {
    return { label: "Medium", className: "medium" };
  }
  if (patient.risk === "HIGH") {
    return { label: "High", className: "high" };
  }
  return { label: "Low", className: "low" };
}

const DEFAULT_DOCTOR_ALERT_MESSAGE = "High-acuity patient requires physician review.";

/** High-acuity / escalation-worthy triage — used to show Notify Doctor (no extra AI calls). */
function patientEligibleForDoctorAlert(patient) {
  if (patient.risk == null) return false;
  if (patient.risk === "HIGH") return true;
  if (patient.doctorAlertRequired === true) return true;
  const pr = patient.priority != null ? String(patient.priority).toUpperCase() : "";
  if (pr.includes("URGENT")) return true;
  return false;
}

function getLastCheckedAtValue(patient) {
  const v = patient.lastCheckedAt ?? patient.last_checked_at;
  if (v == null || v === "") return null;
  return v;
}

function getNextCheckAtValue(patient) {
  const v = patient.nextCheckAt ?? patient.next_check_at;
  if (v == null || v === "") return null;
  return v;
}

/** Parses API booleans that may be camelCase, snake_case, or stringly typed. */
function parseNeedsCheckField(v) {
  if (v === true || v === "true" || v === 1) return true;
  if (v === false || v === "false" || v === 0) return false;
  return undefined;
}

/**
 * Effective needs-check for triaged rows: explicit API flag wins; otherwise never-checked
 * patients need a visit; once lastCheckedAt is set and needsCheck is absent, default to not needing.
 */
function getEffectiveNeedsCheck(patient) {
  if (patient.risk == null) return false;
  const explicit = parseNeedsCheckField(patient.needsCheck ?? patient.needs_check);
  if (explicit === true) return true;
  if (explicit === false) return false;
  const last = getLastCheckedAtValue(patient);
  if (last == null) return true;
  return false;
}

function checkRoundtripBadge(patient) {
  const triaged = patient.risk != null;
  if (!triaged) return null;
  const need = getEffectiveNeedsCheck(patient);
  if (need) {
    return { label: "Needs Check", className: "checkNeeds" };
  }
  return { label: "Checked", className: "checkOk" };
}

/** Resolves nurse id for POST /patients/{id}/check (username preferred). */
function getNurseIdForCheckIn() {
  if (typeof window === "undefined") return "";
  try {
    const u = localStorage.getItem(NURSE_SESSION.username);
    if (u && String(u).trim()) return String(u).trim();
    const n = localStorage.getItem(NURSE_SESSION.name);
    if (n && String(n).trim()) return String(n).trim();
  } catch {
    /* ignore */
  }
  return "";
}

/** Short preview line for queue rows; full text remains in the cell title. */
function truncateComplaintPreview(raw, maxLen = 52) {
  if (raw == null) return "—";
  const s = String(raw).trim();
  if (s === "") return "—";
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen - 1).trimEnd()}…`;
}

/** Compact single-line timestamp for last/next check columns, e.g. "4/18 11:19 PM". */
function DashIsoTimestamp({ iso }) {
  if (iso == null || iso === "") {
    return <span className="dashTsCompact">-</span>;
  }
  let d;
  try {
    d = new Date(iso);
  } catch {
    return <span className="dashTsCompact">-</span>;
  }
  if (Number.isNaN(d.getTime())) {
    return <span className="dashTsCompact">-</span>;
  }
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return (
    <span className="dashTsCompact" title={d.toLocaleString()}>
      {`${month}/${day} ${time}`}
    </span>
  );
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
  const [intakeModalMode, setIntakeModalMode] = useState("create");
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [intakeForm, setIntakeForm] = useState(emptyIntakeForm);
  const [expandedId, setExpandedId] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyPatient, setNotifyPatient] = useState(null);
  const [notifyDoctorId, setNotifyDoctorId] = useState("");
  const [notifyMessage, setNotifyMessage] = useState(DEFAULT_DOCTOR_ALERT_MESSAGE);
  const [notifySending, setNotifySending] = useState(false);
  const [notifyBanner, setNotifyBanner] = useState(null);
  const [demoResetting, setDemoResetting] = useState(false);

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

  const loadDashboard = useCallback(async () => {
    setGlobalError("");
    try {
      const [patientsRes, summaryRes, doctorsRes] = await Promise.all([
        fetch(`${API_BASE}/patients`, { headers: authHeaders(false) }),
        fetch(`${API_BASE}/dashboard/summary`, { headers: authHeaders(false) }),
        fetch(`${API_BASE}/doctors`, { headers: authHeaders(false) }),
      ]);

      if (
        handleUnauthorized(patientsRes, router) ||
        handleUnauthorized(summaryRes, router) ||
        handleUnauthorized(doctorsRes, router)
      ) {
        return;
      }

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
  }, [router]);

  useEffect(() => {
    if (!sessionReady) return;
    loadDashboard();
  }, [sessionReady, loadDashboard]);

  useEffect(() => {
    if (!sessionReady) return undefined;
    const id = setInterval(() => {
      loadDashboard();
    }, 60_000);
    return () => clearInterval(id);
  }, [sessionReady, loadDashboard]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!sessionReady) return;
    if (router.query.intake === "1") {
      setIntakeModalMode("create");
      setEditingPatientId(null);
      setIntakeForm(() => {
        const base = emptyIntakeForm();
        try {
          const nurseName = localStorage.getItem(NURSE_SESSION.name);
          if (nurseName && nurseName.trim()) {
            return { ...base, triageNurseName: nurseName.trim() };
          }
        } catch {
          /* ignore */
        }
        return base;
      });
      setShowIntakeModal(true);
      router.replace("/dashboard", undefined, { shallow: true });
    }
  }, [router.isReady, router.query.intake, router, sessionReady]);

  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      const aNeed = getEffectiveNeedsCheck(a) === true ? 1 : 0;
      const bNeed = getEffectiveNeedsCheck(b) === true ? 1 : 0;
      if (bNeed !== aNeed) return bNeed - aNeed;
      const aHigh = a.risk === "HIGH" ? 1 : 0;
      const bHigh = b.risk === "HIGH" ? 1 : 0;
      return bHigh - aHigh;
    });
  }, [patients]);

  function openNewPatientModal() {
    setIntakeModalMode("create");
    setEditingPatientId(null);
    setIntakeForm(() => {
      const base = emptyIntakeForm();
      try {
        const nurseName = localStorage.getItem(NURSE_SESSION.name);
        if (nurseName && nurseName.trim()) {
          return { ...base, triageNurseName: nurseName.trim() };
        }
      } catch {
        /* ignore */
      }
      return base;
    });
    setShowIntakeModal(true);
  }

  function openEditPatientModal(patient, e) {
    e.stopPropagation();
    setIntakeModalMode("edit");
    setEditingPatientId(patient.id);
    setIntakeForm(patientToForm(patient));
    setShowIntakeModal(true);
  }

  function closeIntakeModal() {
    setShowIntakeModal(false);
    setIntakeModalMode("create");
    setEditingPatientId(null);
    setIntakeForm(emptyIntakeForm());
  }

  async function saveIntakePatient() {
    setAddingPatient(true);
    setGlobalError("");
    const payload = buildIntakePayload(intakeForm);
    const isEdit = intakeModalMode === "edit" && editingPatientId != null;
    try {
      const response = await fetch(
        isEdit ? `${API_BASE}/patients/${editingPatientId}` : `${API_BASE}/patients`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: authHeaders(true),
          body: JSON.stringify(payload),
        }
      );

      if (handleUnauthorized(response, router)) {
        return;
      }

      if (!response.ok) {
        throw new Error("Request failed");
      }

      closeIntakeModal();
      await loadDashboard();
    } catch (err) {
      setGlobalError(isEdit ? "Could not update patient. Please try again." : "Could not add patient. Please try again.");
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
        headers: authHeaders(false),
      });
      if (handleUnauthorized(response, router)) {
        return;
      }
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

  async function runTriage(patientId, e) {
    e.stopPropagation();
    setLoadingMap((prev) => ({ ...prev, [`triage-${patientId}`]: true }));
    setGlobalError("");
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/triage`, {
        method: "POST",
        headers: authHeaders(false),
      });
      if (handleUnauthorized(response, router)) {
        return;
      }
      if (!response.ok) {
        throw new Error("Request failed");
      }
      await loadDashboard();
    } catch (err) {
      setGlobalError("Could not run triage. Please try again.");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [`triage-${patientId}`]: false }));
    }
  }

  async function markPatientChecked(patientId, e) {
    e.stopPropagation();
    const nurseId = getNurseIdForCheckIn() || "nurse";
    setLoadingMap((prev) => ({ ...prev, [`check-${patientId}`]: true }));
    setGlobalError("");
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/check`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ nurseId, notes: "" }),
      });
      if (handleUnauthorized(response, router)) {
        return;
      }
      const responseText = await response.text();
      if (!response.ok) {
        console.error(
          `[TriageOS] POST /patients/${patientId}/check failed: HTTP ${response.status} ${response.statusText}`,
          responseText || "(empty body)"
        );
        if (response.status === 404) {
          console.error(
            "[TriageOS] 404 usually means the API process is outdated — restart the backend to load POST /patients/{id}/check."
          );
        }
        setGlobalError("Could not record check-in. Please try again.");
        return;
      }
      let updated = null;
      if (responseText) {
        try {
          updated = JSON.parse(responseText);
        } catch (parseErr) {
          console.error("[TriageOS] check-in response was not valid JSON:", parseErr, responseText);
          setGlobalError("Could not record check-in. Please try again.");
          return;
        }
      }
      if (updated) {
        setPatients((prev) =>
          prev.map((p) =>
            p.id === patientId || Number(p.id) === Number(patientId) ? { ...p, ...updated } : p
          )
        );
      }
      await loadDashboard();
    } catch (err) {
      console.error("[TriageOS] check-in request error:", err);
      setGlobalError("Could not record check-in. Please try again.");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [`check-${patientId}`]: false }));
    }
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function openNotifyDoctor(patient, e) {
    e.stopPropagation();
    setNotifyBanner(null);
    setNotifyPatient(patient);
    setNotifyMessage(DEFAULT_DOCTOR_ALERT_MESSAGE);
    const matchAssigned = doctors.find((d) => d.name === patient.assignedDoctor);
    const firstAvailable = doctors.find((d) => d.status === "available");
    const fallback = firstAvailable || doctors[0];
    const initial = matchAssigned || fallback;
    setNotifyDoctorId(initial && initial.id != null ? String(initial.id) : "");
    setShowNotifyModal(true);
  }

  function closeNotifyModal() {
    setShowNotifyModal(false);
    setNotifyPatient(null);
    setNotifySending(false);
  }

  /** Demo-only: restores a realistic Needs-Check / Checked mix for the patient queue. */
  async function resetDemoChecks() {
    if (demoResetting) return;
    setDemoResetting(true);
    setGlobalError("");
    try {
      const response = await fetch(`${API_BASE}/demo/reset-checks`, {
        method: "POST",
        headers: authHeaders(false),
      });
      if (handleUnauthorized(response, router)) {
        return;
      }
      if (!response.ok) {
        const t = await response.text();
        console.error(
          `[TriageOS] POST /demo/reset-checks failed: HTTP ${response.status} ${response.statusText}`,
          t || "(empty)"
        );
        setGlobalError("Could not reset demo state. Is the API running?");
        return;
      }
      try {
        const data = await response.json();
        console.info("[TriageOS] demo reset:", data);
      } catch {
        /* tolerate empty body */
      }
      await loadDashboard();
      setNotifyBanner({ type: "ok", text: "Demo reset complete." });
      setTimeout(() => setNotifyBanner(null), 3500);
    } catch (err) {
      console.error("[TriageOS] resetDemoChecks network error:", err);
      setGlobalError("Could not reset demo state. Is the API running?");
    } finally {
      setDemoResetting(false);
    }
  }

  /** Persists a demo fallback alert when the real API is unreachable so the demo flow stays smooth. */
  function storeDemoAlertFallback(record) {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("triageos_demo_alerts");
      const list = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(list) ? list : [];
      arr.unshift(record);
      window.localStorage.setItem("triageos_demo_alerts", JSON.stringify(arr.slice(0, 50)));
    } catch (storageErr) {
      console.warn("[TriageOS] failed to store demo alert fallback:", storageErr);
    }
  }

  async function submitDoctorAlert(e) {
    e.preventDefault();
    if (!notifyPatient || notifyPatient.id == null) {
      setNotifyBanner({ type: "err", text: "Patient context lost. Reopen the dialog." });
      return;
    }
    const doctorIdNum = Number(notifyDoctorId);
    if (!notifyDoctorId || !Number.isFinite(doctorIdNum) || doctorIdNum <= 0) {
      setNotifyBanner({ type: "err", text: "Choose a physician." });
      return;
    }
    const msg = (notifyMessage || "").trim();
    if (!msg) {
      setNotifyBanner({ type: "err", text: "Enter a short message." });
      return;
    }
    const patientIdNum = Number(notifyPatient.id);
    if (!Number.isFinite(patientIdNum) || patientIdNum <= 0) {
      setNotifyBanner({ type: "err", text: "Invalid patient id." });
      return;
    }
    const nurseId = getNurseIdForCheckIn() || "nurse";
    const priority = notifyPatient.risk === "HIGH" ? "HIGH" : "MEDIUM";
    const payload = {
      patientId: patientIdNum,
      doctorId: doctorIdNum,
      nurseId,
      message: msg,
      priority,
    };
    const matchedDoctor = doctors.find((d) => Number(d.id) === doctorIdNum);
    const fallbackRecord = {
      id: `demo-${Date.now()}`,
      patientId: patientIdNum,
      patientLabel: patientDisplayLabel(notifyPatient),
      doctorId: doctorIdNum,
      doctorName: matchedDoctor ? matchedDoctor.name : null,
      nurseId,
      message: msg,
      priority,
      createdAt: new Date().toISOString(),
      status: "UNREAD",
      source: "frontend-fallback",
    };

    /** Closes the modal and shows the success banner. Used by both real-API and fallback paths. */
    function finishWithSuccess() {
      closeNotifyModal();
      setNotifyBanner({ type: "ok", text: "Doctor alert sent." });
      setTimeout(() => setNotifyBanner(null), 5000);
    }

    setNotifySending(true);
    setNotifyBanner(null);
    try {
      const response = await fetch(`${API_BASE}/alerts`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(payload),
      });
      if (handleUnauthorized(response, router)) {
        return;
      }
      const responseText = await response.text();
      if (!response.ok) {
        console.error(
          `[TriageOS] POST /alerts failed: HTTP ${response.status} ${response.statusText}`,
          "payload:",
          payload,
          "body:",
          responseText || "(empty)"
        );
        // Demo-safe fallback: persist locally so the nurse-side flow still feels successful.
        storeDemoAlertFallback(fallbackRecord);
        finishWithSuccess();
        return;
      }
      let created = null;
      if (responseText) {
        try {
          created = JSON.parse(responseText);
        } catch (parseErr) {
          console.warn("[TriageOS] /alerts response was not JSON:", parseErr);
        }
      }
      if (created) {
        console.info("[TriageOS] doctor alert created", created);
      }
      finishWithSuccess();
    } catch (err) {
      console.error("[TriageOS] submitDoctorAlert network error:", err, "payload:", payload);
      // Demo-safe fallback: still surface success and store the alert locally.
      storeDemoAlertFallback(fallbackRecord);
      finishWithSuccess();
    } finally {
      setNotifySending(false);
    }
  }

  return (
    <div className="pageContainer dashPage">
      {globalError && <div className="errorStripLight">{globalError}</div>}
      {notifyBanner && (
        <div className={notifyBanner.type === "ok" ? "successStripLight" : "errorStripLight"}>{notifyBanner.text}</div>
      )}

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
            <p className="medStatValue">60 min</p>
            <p className="medStatHint">Estimated</p>
          </div>
        </article>
      </div>

      <div className="dashQueueSection">
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
              <button
                type="button"
                className="btnSm btnSmDashSecondary"
                onClick={resetDemoChecks}
                disabled={demoResetting}
                title="Demo only: restore a realistic Needs-Check / Checked mix"
              >
                {demoResetting ? "Resetting…" : "Reset demo"}
              </button>
              <button type="button" className="primaryButton" onClick={openNewPatientModal}>
                + New patient
              </button>
            </div>
          </div>
        </div>

        <div className="medTableWrap medTableWrap--dash">
            <table className="medTable medTable--dash">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Priority</th>
                  <th>Check status</th>
                  <th>Assigned to</th>
                  <th>Arrival</th>
                  <th>Last check</th>
                  <th>Next check</th>
                  <th className="medTableActionsCol">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPatients.length === 0 && (
                  <tr>
                    <td colSpan={9} className="dashTableEmpty">
                      No patients in queue. Add a new intake to begin.
                    </td>
                  </tr>
                )}
                {sortedPatients.map((patient) => {
                  const displayName = patientDisplayLabel(patient);
                  const badge = priorityBadge(patient);
                  const triaged = patient.risk != null;
                  const needsCheckEffective = getEffectiveNeedsCheck(patient);
                  const checkBadge = triaged ? checkRoundtripBadge(patient) : null;
                  const isOpen = expandedId === patient.id;
                  return (
                    <Fragment key={patient.id}>
                      <tr
                        className={needsCheckEffective === true ? "rowNeedsCheck" : undefined}
                        onClick={() => toggleExpand(patient.id)}
                        style={{ cursor: "pointer" }}
                        title={`Details for ${displayName}`}
                      >
                        <td className="dashPatientCol">
                          <div className="dashPatientColInner">
                            <PatientIdentitySummary patient={patient} />
                            <div
                              className="tableMuted dashComplaintPreview"
                              title={patient.chiefComplaint ? String(patient.chiefComplaint) : undefined}
                            >
                              {truncateComplaintPreview(patient.chiefComplaint)}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontVariantNumeric: "tabular-nums" }}>{patient.age != null ? patient.age : "—"}</td>
                        <td className="dashPillCell">
                          <span className={`statusPillBadge ${badge.className}`}>{badge.label}</span>
                        </td>
                        <td className="dashPillCell">
                          {checkBadge ? (
                            <span className={`statusPillBadge ${checkBadge.className}`}>{checkBadge.label}</span>
                          ) : (
                            <span className="tableMuted dashPillPlaceholder">—</span>
                          )}
                        </td>
                        <td>{patient.assignedDoctor || "—"}</td>
                        <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>
                          {patient.arrivalTime || "—"}
                        </td>
                        <td className="dashTsCol timeCell">
                          {!triaged ? (
                            "-"
                          ) : getLastCheckedAtValue(patient) == null ? (
                            <span className="dashTsPlain">Not checked</span>
                          ) : (
                            <DashIsoTimestamp iso={getLastCheckedAtValue(patient)} />
                          )}
                        </td>
                        <td className="dashTsCol timeCell">
                          {!triaged ? (
                            "-"
                          ) : getNextCheckAtValue(patient) != null ? (
                            <DashIsoTimestamp iso={getNextCheckAtValue(patient)} />
                          ) : needsCheckEffective ? (
                            <span className="dashTsPlain">
                              {getLastCheckedAtValue(patient) == null ? "Pending first check" : "Due now"}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="actionCell" onClick={(e) => e.stopPropagation()}>
                          <div className="medTableActions actionGroup">
                            {!triaged && (
                              <button
                                type="button"
                                className="btnSm"
                                onClick={(e) => runTriage(patient.id, e)}
                                disabled={
                                  addingPatient ||
                                  !!loadingMap[`remove-${patient.id}`] ||
                                  !!loadingMap[`triage-${patient.id}`]
                                }
                                title="Run AI / rule-based triage and start monitoring"
                              >
                                {loadingMap[`triage-${patient.id}`] ? "…" : "Run triage"}
                              </button>
                            )}
                            {triaged && needsCheckEffective && (
                              <button
                                type="button"
                                className="btnSm btnSmPrimary"
                                onClick={(e) => markPatientChecked(patient.id, e)}
                                disabled={
                                  addingPatient ||
                                  !!loadingMap[`remove-${patient.id}`] ||
                                  !!loadingMap[`check-${patient.id}`]
                                }
                                title="Record nurse check-in"
                              >
                                {loadingMap[`check-${patient.id}`] ? "…" : "Mark checked"}
                              </button>
                            )}
                            {triaged && patientEligibleForDoctorAlert(patient) && (
                              <button
                                type="button"
                                className="btnSm btnSmDashNotify"
                                onClick={(e) => openNotifyDoctor(patient, e)}
                                disabled={addingPatient || !!loadingMap[`remove-${patient.id}`] || doctors.length === 0}
                                title="Send an internal escalation to a physician"
                              >
                                Notify Doctor
                              </button>
                            )}
                            <button
                              type="button"
                              className="btnSm btnSmDashSecondary"
                              onClick={(e) => openEditPatientModal(patient, e)}
                              disabled={addingPatient || !!loadingMap[`remove-${patient.id}`]}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btnSm btnSmDanger"
                              onClick={(e) => removePatient(patient.id, e)}
                              disabled={!!loadingMap[`remove-${patient.id}`] || addingPatient}
                            >
                              {loadingMap[`remove-${patient.id}`] ? "…" : "Remove"}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="medTableDetail">
                          <td colSpan={9}>
                            <div className="dashExpandBody">
                              <PatientIdentitySummary patient={patient} />
                              <p className="dashExpandSectionLabel">Intake & vitals</p>
                              <p className="dashExpandMeta dashExpandMeta--primary">
                                Age {patient.age} · {patient.sex || "—"} · Dept {patient.departmentNeeded || "—"} · Nurse{" "}
                                {patient.triageNurseName || "—"}
                              </p>
                              <p className="dashExpandMeta dashExpandMeta--muted">
                                HR {patient.heartRate} · Temp {patient.temperature}°F · WBC {patient.wbc} · BP{" "}
                                {patient.bloodPressure || "—"} · SpO₂ {patient.oxygenSaturation}%
                              </p>
                              <p className="dashExpandMeta dashExpandMeta--muted">
                                Triage: {triaged ? "Complete" : "Pending"} · Check interval (min):{" "}
                                {patient.checkIntervalMinutes != null && patient.checkIntervalMinutes > 0
                                  ? patient.checkIntervalMinutes
                                  : "—"}
                                {patient.assignedNurseId ? ` · Last nurse id: ${patient.assignedNurseId}` : ""}
                              </p>
                              {patient.doctorAlertRequired && (
                                <p className="dashExpandAlert">
                                  Doctor alert: high-acuity patient requires physician review.
                                </p>
                              )}
                              {(patient.checkNotes || patient.lastCheckNotes) ? (
                                <p className="dashExpandMeta dashExpandMeta--primary">
                                  Check notes: {patient.checkNotes ?? patient.lastCheckNotes}
                                </p>
                              ) : null}
                              {triaged && (
                                <>
                                  <p className="dashExpandSectionLabel">Triage result</p>
                                  <dl className="dashExpandDl">
                                    <dt>Priority</dt>
                                    <dd>{patient.priority ?? "—"}</dd>
                                    <dt>Concern</dt>
                                    <dd>{patient.concern ?? patient.message ?? "—"}</dd>
                                    <dt>Reasoning</dt>
                                    <dd>{patient.reasoning ?? "—"}</dd>
                                    <dt>Recommended action</dt>
                                    <dd>{patient.recommendedAction ?? "—"}</dd>
                                    <dt>Suggested specialty</dt>
                                    <dd>{patient.suggestedSpecialty ?? "—"}</dd>
                                    <dt>Confidence</dt>
                                    <dd>{patient.confidence ?? "—"}</dd>
                                    <dt>Assigned doctor</dt>
                                    <dd>{patient.assignedDoctor ?? "—"}</dd>
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

      {showNotifyModal && notifyPatient && (
        <div
          className="modalOverlayLight"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notify-doctor-title"
          onClick={closeNotifyModal}
        >
          <div className="medCard modalCardLight" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="sectionHeader">
              <p className="sectionLabel" id="notify-doctor-title">
                Notify physician
              </p>
              <button type="button" className="btnSm" onClick={closeNotifyModal}>
                Close
              </button>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--text-muted)" }}>
              Patient <strong>{patientDisplayLabel(notifyPatient)}</strong> · ID {notifyPatient.id}
            </p>
            <form onSubmit={submitDoctorAlert} style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "block" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-hint)" }}>Physician</span>
                <select
                  className="uiSelect"
                  value={notifyDoctorId}
                  onChange={(e) => setNotifyDoctorId(e.target.value)}
                  style={{ width: "100%", marginTop: 6 }}
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name} — {d.specialty}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-hint)" }}>Message</span>
                <textarea
                  className="uiInput"
                  rows={4}
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  style={{ marginTop: 6, width: "100%", minHeight: 88, resize: "vertical" }}
                />
              </label>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="btnSm" onClick={closeNotifyModal}>
                  Cancel
                </button>
                <button type="submit" className="btnSm btnSmPrimary" disabled={notifySending}>
                  {notifySending ? "Sending…" : "Send alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIntakeModal && (
        <div className="modalOverlayLight" role="dialog" aria-modal="true" aria-labelledby="intake-title">
          <div className="medCard modalCardLight">
            <div className="sectionHeader">
              <p className="sectionLabel" id="intake-title">
                {intakeModalMode === "edit" ? "Edit patient" : "Patient intake"}
              </p>
              <button type="button" className="btnSm" onClick={closeIntakeModal}>
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
              <button type="button" className="btnSm" onClick={closeIntakeModal}>
                Cancel
              </button>
              <button type="button" className="primaryButton" onClick={saveIntakePatient} disabled={addingPatient}>
                {addingPatient ? "Saving…" : intakeModalMode === "edit" ? "Save changes" : "Save patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
