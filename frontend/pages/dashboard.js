import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const [patients, setPatients] = useState([]);
  const [summary, setSummary] = useState({
    totalPatients: 0,
    highRiskPatients: 0,
    availableDoctors: 0,
  });
  const [loadingMap, setLoadingMap] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [addingPatient, setAddingPatient] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeForm, setIntakeForm] = useState({
    fullName: "",
    age: "",
    sex: "",
    patientIdOrRoom: "",
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

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setGlobalError("");
    try {
      const [patientsRes, summaryRes] = await Promise.all([
        fetch("http://localhost:8080/patients"),
        fetch("http://localhost:8080/dashboard/summary"),
      ]);

      if (!patientsRes.ok || !summaryRes.ok) {
        throw new Error("Failed request");
      }

      const [patientsData, summaryData] = await Promise.all([
        patientsRes.json(),
        summaryRes.json(),
      ]);

      setPatients(patientsData);
      setSummary(summaryData);
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

  function patientTrend(patient) {
    if (patient.risk !== "HIGH") return "Stable";
    return patient.heartRate > 120 || patient.temperature >= 102.5 ? "Worsening" : "Stable";
  }

  async function addPatient() {
    setAddingPatient(true);
    setGlobalError("");
    try {
      const response = await fetch("http://localhost:8080/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: intakeForm.fullName,
          heartRate: Number(intakeForm.heartRate),
          temperature: Number(intakeForm.temperature),
          wbc: Number(intakeForm.wbc),
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setIntakeForm({
        fullName: "",
        age: "",
        sex: "",
        patientIdOrRoom: "",
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
      setShowIntakeModal(false);
      await loadAllData();
    } catch (err) {
      setGlobalError("Could not add patient. Please try again.");
    } finally {
      setAddingPatient(false);
    }
  }

  async function triagePatient(patientId) {
    setLoadingMap((prev) => ({ ...prev, [`triage-${patientId}`]: true }));
    setGlobalError("");
    try {
      const response = await fetch(`http://localhost:8080/patients/${patientId}/triage`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      await loadAllData();
    } catch (err) {
      setGlobalError("Could not triage patient. Please try again.");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [`triage-${patientId}`]: false }));
    }
  }

  async function removePatient(patientId) {
    setLoadingMap((prev) => ({ ...prev, [`remove-${patientId}`]: true }));
    setGlobalError("");
    try {
      const response = await fetch(`http://localhost:8080/patients/${patientId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      await loadAllData();
    } catch (err) {
      setGlobalError("Could not remove patient. Please try again.");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [`remove-${patientId}`]: false }));
    }
  }

  return (
    <section className="dashboardWrap pageContainer">
      {globalError && <section className="errorStrip">{globalError}</section>}

      <section className="summaryGrid">
        <article className="glassPanel summaryCard">
          <p className="sectionLabel">Total Patients</p>
          <p className="summaryValue">{summary.totalPatients}</p>
        </article>
        <article className="glassPanel summaryCard">
          <p className="sectionLabel">High Risk Patients</p>
          <p className="summaryValue">{summary.highRiskPatients}</p>
        </article>
        <article className="glassPanel summaryCard">
          <p className="sectionLabel">Available Doctors</p>
          <p className="summaryValue">{summary.availableDoctors}</p>
        </article>
      </section>

      <section className="glassPanel intakePanel panelPaddingLg">
        <div className="sectionHeader">
          <p className="sectionLabel">New Patient Intake</p>
        </div>
        <button className="primaryButton" onClick={() => setShowIntakeModal(true)}>
          New Patient Intake
        </button>
      </section>

      {showIntakeModal && (
        <section className="modalOverlay">
          <div className="glassPanel intakeModal">
            <div className="sectionHeader">
              <p className="sectionLabel">Patient Pre-Checkup Intake</p>
            </div>

            <div className="formSection sectionContainer">
              <p className="sectionLabel">Patient Identity</p>
              <div className="formGrid">
                <label>
                  Full Name
                  <input className="uiInput"
                    value={intakeForm.fullName}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  />
                </label>
                <label>
                  Age
                  <input className="uiInput"
                    type="number"
                    value={intakeForm.age}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, age: e.target.value }))}
                  />
                </label>
                <label>
                  Sex
                  <select className="uiSelect"
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
                  Patient ID or Room Number
                  <input className="uiInput"
                    value={intakeForm.patientIdOrRoom}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, patientIdOrRoom: e.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div className="formSection sectionContainer">
              <p className="sectionLabel">Vital Signs</p>
              <div className="formGrid">
                <label>
                  Heart Rate
                  <input className="uiInput"
                    type="number"
                    value={intakeForm.heartRate}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, heartRate: e.target.value }))}
                  />
                </label>
                <label>
                  Temperature
                  <input className="uiInput"
                    type="number"
                    step="0.1"
                    value={intakeForm.temperature}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, temperature: e.target.value }))}
                  />
                </label>
                <label>
                  WBC
                  <input className="uiInput"
                    type="number"
                    value={intakeForm.wbc}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, wbc: e.target.value }))}
                  />
                </label>
                <label>
                  Blood Pressure
                  <input className="uiInput"
                    value={intakeForm.bloodPressure}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, bloodPressure: e.target.value }))}
                  />
                </label>
                <label>
                  Oxygen Saturation
                  <input className="uiInput"
                    value={intakeForm.oxygenSaturation}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, oxygenSaturation: e.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div className="formSection sectionContainer">
              <p className="sectionLabel">Clinical Notes</p>
              <div className="formGrid">
                <label>
                  Chief Complaint
                  <input className="uiInput"
                    value={intakeForm.chiefComplaint}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
                  />
                </label>
                <label>
                  Symptom Duration
                  <input className="uiInput"
                    value={intakeForm.symptomDuration}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, symptomDuration: e.target.value }))}
                  />
                </label>
                <label>
                  Pain Level
                  <input className="uiInput"
                    type="number"
                    min="0"
                    max="10"
                    value={intakeForm.painLevel}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, painLevel: e.target.value }))}
                  />
                </label>
                <label>
                  Fever
                  <select className="uiSelect"
                    value={intakeForm.fever}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, fever: e.target.value }))}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label>
                  Shortness of Breath
                  <select className="uiSelect"
                    value={intakeForm.shortnessOfBreath}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, shortnessOfBreath: e.target.value }))}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label>
                  Chest Pain
                  <select className="uiSelect"
                    value={intakeForm.chestPain}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, chestPain: e.target.value }))}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label>
                  Arrival Time
                  <input className="uiInput"
                    value={intakeForm.arrivalTime}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, arrivalTime: e.target.value }))}
                  />
                </label>
                <label>
                  Triage Nurse Name
                  <input className="uiInput"
                    value={intakeForm.triageNurseName}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, triageNurseName: e.target.value }))}
                  />
                </label>
                <label>
                  Department Needed
                  <input className="uiInput"
                    value={intakeForm.departmentNeeded}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, departmentNeeded: e.target.value }))}
                  />
                </label>
                <label className="spanTwo">
                  Priority Note
                  <textarea className="uiTextarea"
                    value={intakeForm.priorityNote}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, priorityNote: e.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div className="modalActions">
              <button className="primaryButton" onClick={addPatient} disabled={addingPatient}>
                {addingPatient ? "Saving..." : "Save Patient"}
              </button>
              <button className="dangerButton" onClick={() => setShowIntakeModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="commandGrid">
        <section className="glassPanel queuePanel panelPaddingLg">
          <div className="sectionHeader">
            <p className="sectionLabel">Live Triage Queue</p>
          </div>
          <div className="patientList">
            {sortedPatients.map((patient) => {
              const isHigh = patient.risk === "HIGH";
              const trend = patientTrend(patient);
              const riskClass = patient.risk === "HIGH" ? "high" : patient.risk === "LOW" ? "low" : "pending";
              return (
                <article key={patient.id} className={`patientCard surfaceCard ${riskClass}`}>
                  <h3>{patient.name}</h3>
                  <div className="vitalsRow">
                    <span>HR: {patient.heartRate}</span>
                    <span>Temp: {patient.temperature}°F</span>
                    <span>WBC: {patient.wbc}</span>
                  </div>

                  <div className="buttonRow">
                    <button
                      className="primaryButton"
                      onClick={() => triagePatient(patient.id)}
                      disabled={!!loadingMap[`triage-${patient.id}`]}
                    >
                      {loadingMap[`triage-${patient.id}`] ? "Triaging..." : "Triage"}
                    </button>
                    <button
                      className="dangerButton"
                      onClick={() => removePatient(patient.id)}
                      disabled={!!loadingMap[`remove-${patient.id}`]}
                    >
                      {loadingMap[`remove-${patient.id}`] ? "Removing..." : "Remove"}
                    </button>
                  </div>

                  {patient.risk && (
                    <div className="analysis">
                      <p className="sectionLabel">System Analysis</p>
                      <div className="riskRow">
                        <span className={`statusPillBadge ${isHigh ? "high" : "low"}`}>{patient.risk}</span>
                        <span className="diagnosis">{patient.message}</span>
                      </div>
                      <p className="reasoning">{patient.reasoning}</p>
                      <p className="meta">Confidence: {patient.confidence}</p>
                      <p className={`meta ${trend === "Worsening" ? "warn" : ""}`}>
                        Trend: {trend === "Worsening" ? "⚠ Worsening" : "Stable"}
                      </p>

                      {isHigh && (
                        <div className="recommended">
                          <p className="sectionLabel">Recommended Action</p>
                          <p>Immediate evaluation required</p>
                          <p>Order infection panel and blood tests</p>
                          <p>Monitor vitals continuously</p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <style jsx>{`
        .errorStrip {
          border-radius: 14px;
          border: 1px solid rgba(255, 126, 145, 0.56);
          background: rgba(87, 24, 39, 0.72);
          color: #ffd7df;
          font-size: 17px;
          padding: 14px 18px;
        }

        .summaryGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .summaryCard {
          padding: 28px;
          border-color: rgba(159, 223, 255, 0.4);
        }

        .summaryValue {
          margin: 12px 0 0;
          font-size: 48px;
          font-weight: 700;
          color: #f2f8ff;
          letter-spacing: 0.01em;
        }

        .intakePanel {
          border-color: rgba(152, 214, 255, 0.38);
        }

        .modalOverlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(6, 12, 28, 0.62);
          backdrop-filter: blur(4px);
          display: grid;
          place-items: center;
          padding: 26px;
        }

        .intakeModal {
          width: min(1080px, 100%);
          max-height: 88vh;
          overflow: auto;
          padding: 28px;
          display: grid;
          gap: 18px;
        }

        .formSection {
          padding: 16px;
        }

        .formGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .formGrid label {
          display: grid;
          gap: 8px;
          font-size: 15px;
          color: #c8d9f5;
          font-weight: 600;
        }

        .formGrid .uiInput,
        .formGrid .uiSelect {
          height: 50px;
        }

        .formGrid .uiTextarea {
          min-height: 92px;
        }

        .spanTwo {
          grid-column: span 2;
        }

        .modalActions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .commandGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: start;
        }

        .patientList {
          margin-top: 14px;
          display: grid;
          gap: 18px;
          min-height: 220px;
        }

        .patientList:empty::after {
          content: "No patients yet. Add a patient to begin triage.";
          display: block;
          border-radius: 14px;
          border: 1px dashed rgba(157, 219, 255, 0.38);
          background: rgba(17, 32, 64, 0.5);
          color: #b9cff2;
          font-size: 18px;
          padding: 26px 20px;
          text-align: center;
        }

        .patientCard {
          padding: 22px;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
        }

        .patientCard:hover {
          transform: translateY(-1px);
          box-shadow:
            inset 0 1px 0 rgba(219, 243, 255, 0.17),
            0 14px 24px rgba(8, 17, 40, 0.36);
        }

        .patientCard.high {
          border-color: rgba(255, 126, 141, 0.62);
          background: linear-gradient(165deg, rgba(72, 26, 39, 0.8), rgba(57, 21, 33, 0.86));
          box-shadow: 0 0 18px rgba(188, 56, 80, 0.3);
        }

        .patientCard.low {
          border-color: rgba(130, 211, 205, 0.5);
          background: linear-gradient(165deg, rgba(24, 63, 71, 0.74), rgba(20, 49, 59, 0.82));
          box-shadow: 0 0 14px rgba(52, 152, 146, 0.26);
        }

        h3 {
          margin: 0;
          font-size: 33px;
          color: #f2f8ff;
        }

        .vitalsRow {
          margin-top: 12px;
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
          color: #b8ccee;
          font-size: 19px;
        }

        .buttonRow {
          margin-top: 18px;
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .analysis {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid rgba(162, 203, 235, 0.28);
        }

        .riskRow {
          margin-top: 8px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .diagnosis {
          font-size: 24px;
          font-weight: 700;
          color: #ebf3ff;
        }

        .reasoning {
          margin: 10px 0 0;
          font-size: 19px;
          line-height: 1.45;
          color: #c5d9f8;
        }

        .meta {
          margin: 6px 0 0;
          color: #9fbae2;
          font-size: 17px;
          font-weight: 600;
        }

        .meta.warn {
          color: #ffb8c4;
        }

        .recommended {
          margin-top: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 152, 167, 0.44);
          background: rgba(84, 29, 44, 0.62);
          padding: 14px 16px;
        }

        .recommended p {
          margin: 6px 0 0;
          color: #ffd9df;
          font-size: 17px;
        }

        @media (max-width: 1000px) {
          .summaryGrid {
            grid-template-columns: 1fr;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }

          .spanTwo {
            grid-column: span 1;
          }
        }
      `}</style>
    </section>
  );
}
