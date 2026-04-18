import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  NURSE_SESSION,
  NURSE_STATION_OPTIONS,
  normalizeNurseStaffId,
  isNurseLoggedIn,
} from "../constants/nurseSession";

const DEMO_CREDENTIALS = {
  "N-0104": "demo123",
  "N-0105": "demo123",
};

export default function NurseLoginPage() {
  const router = useRouter();
  const [nurseId, setNurseId] = useState("N-0104");
  const [nurseName, setNurseName] = useState("R. Morgan");
  const [password, setPassword] = useState("");
  const [station, setStation] = useState(NURSE_STATION_OPTIONS[1]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    if (isNurseLoggedIn()) {
      router.replace("/dashboard");
      return;
    }
    try {
      const storedName = localStorage.getItem(NURSE_SESSION.name);
      const storedId = localStorage.getItem(NURSE_SESSION.staffId);
      const storedStation = localStorage.getItem(NURSE_SESSION.station);
      if (storedName) setNurseName(storedName);
      if (storedId) setNurseId(normalizeNurseStaffId(storedId));
      if (storedStation && NURSE_STATION_OPTIONS.includes(storedStation)) setStation(storedStation);
    } catch {
      /* ignore */
    }
  }, [router]);

  function submit(e) {
    e.preventDefault();
    setError("");
    const normalizedId = normalizeNurseStaffId(nurseId);
    const expectedPassword = DEMO_CREDENTIALS[normalizedId];
    if (!expectedPassword || password !== expectedPassword) {
      setError("Invalid credentials");
      return;
    }
    setSaving(true);
    try {
      localStorage.setItem(NURSE_SESSION.loggedIn, "true");
      localStorage.setItem(NURSE_SESSION.name, nurseName.trim() || "Nurse");
      localStorage.setItem(NURSE_SESSION.staffId, normalizedId);
      localStorage.setItem(NURSE_SESSION.station, station);
      localStorage.setItem(NURSE_SESSION.status, "on-duty");
    } finally {
      router.replace("/dashboard");
    }
  }

  return (
    <div className="pageContainer" style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
      <section className="medCard panelPaddingLg" style={{ width: "100%", maxWidth: 460 }}>
        <p className="sectionLabel">Nurse login</p>
        <h1 className="medPanelTitle" style={{ marginTop: 0 }}>
          Hospital workstation sign-in
        </h1>
        <p className="medPanelHint" style={{ marginTop: 0, marginBottom: 16 }}>
          Demo access only. Enter nurse identity and workstation to continue.
        </p>
        {error && <div className="errorStripLight">{error}</div>}

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <label>
            Nurse ID
            <input
              className="uiInput"
              value={nurseId}
              onChange={(e) => setNurseId(normalizeNurseStaffId(e.target.value))}
              placeholder="N-0104"
              autoComplete="off"
            />
          </label>

          <label>
            Nurse name
            <input
              className="uiInput"
              value={nurseName}
              onChange={(e) => setNurseName(e.target.value)}
              placeholder="R. Morgan"
              autoComplete="name"
            />
          </label>

          <label>
            Password
            <input
              className="uiInput"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="demo123"
              autoComplete="current-password"
            />
          </label>

          <label>
            Workstation / floor
            <select className="uiSelect" value={station} onChange={(e) => setStation(e.target.value)}>
              {NURSE_STATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="primaryButton" disabled={saving} style={{ marginTop: 6 }}>
            {saving ? "Signing in..." : "Enter dashboard"}
          </button>
        </form>
      </section>
    </div>
  );
}
