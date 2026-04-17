import { useEffect, useMemo, useState } from "react";

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
        fetch("http://localhost:8080/patients"),
        fetch("http://localhost:8080/doctors"),
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

  return (
    <section className="doctorsWrap pageContainer">
      {error && <section className="errorStrip">{error}</section>}

      <section className="glassPanel doctorBoard panelPaddingLg">
        <div className="sectionHeader">
          <p className="sectionLabel">Doctor Board</p>
        </div>
        <div className="doctorGrid">
          {effectiveDoctors.map((doctor) => {
            const assigned = patientsForDoctor(doctor.name);
            return (
              <article key={doctor.id} className="doctorCard surfaceCard">
                <p className="doctorName">{doctor.name}</p>
                <p className="doctorMeta">{doctor.specialty}</p>
                <p className={`statusPillBadge ${doctor.status === "available" ? "available" : doctor.status === "busy" ? "busy" : "offshift"}`}>
                  {doctor.status}
                </p>

                <div className="doctorControl">
                  <label htmlFor={`doctor-status-${doctor.id}`}>Status</label>
                  <select className="uiSelect"
                    id={`doctor-status-${doctor.id}`}
                    value={doctor.status}
                    onChange={(e) => updateDoctorStatus(doctor.id, e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="off shift">Off Shift</option>
                  </select>
                </div>

                <div className="assignedList">
                  {assigned.length === 0 ? (
                    <p className="assignedItem">No assigned patients</p>
                  ) : (
                    assigned.map((patient) => (
                      <p key={patient.id} className="assignedItem">
                        {patient.name}
                      </p>
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <style jsx>{`
        .errorStrip {
          border-radius: 14px;
          border: 1px solid rgba(255, 126, 145, 0.56);
          background: rgba(87, 24, 39, 0.72);
          color: #ffd7df;
          font-size: 17px;
          padding: 14px 18px;
        }

        .doctorGrid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          min-height: 220px;
        }

        .doctorGrid:empty::after {
          content: "No doctor records available.";
          display: block;
          border-radius: 14px;
          border: 1px dashed rgba(157, 219, 255, 0.38);
          background: rgba(17, 32, 64, 0.5);
          color: #b9cff2;
          font-size: 18px;
          padding: 24px 18px;
          text-align: center;
        }

        .doctorCard {
          padding: 22px;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
        }

        .doctorCard:hover {
          transform: translateY(-1px);
          border-color: rgba(170, 230, 255, 0.5);
          box-shadow:
            inset 0 1px 0 rgba(219, 243, 255, 0.16),
            0 12px 22px rgba(8, 17, 40, 0.34);
        }

        .doctorName {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
          color: #edf5ff;
        }

        .doctorMeta {
          margin: 5px 0 0;
          color: #b4c8eb;
          font-size: 19px;
        }

        .doctorControl {
          margin-top: 14px;
          display: grid;
          gap: 9px;
        }

        .doctorControl label {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 12px;
          color: #a4c5ee;
        }

        .doctorControl select {
          height: 46px;
          padding: 0 10px;
          font-size: 16px;
        }

        .assignedList {
          margin-top: 14px;
          display: grid;
          gap: 9px;
        }

        .assignedItem {
          margin: 0;
          border-radius: 10px;
          padding: 11px 13px;
          font-size: 17px;
          background: rgba(20, 38, 72, 0.68);
          color: #d7e5fb;
          border: 1px solid rgba(144, 196, 235, 0.3);
        }

        @media (max-width: 1000px) {
          .doctorGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
