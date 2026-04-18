import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { API_BASE } from "../lib/api";
import {
  NURSE_SESSION,
  NURSE_STATION_OPTIONS,
  isNurseLoggedIn,
} from "../constants/nurseSession";

export default function NurseLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [station, setStation] = useState(NURSE_STATION_OPTIONS[1]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    if (isNurseLoggedIn()) {
      router.replace("/dashboard");
      return;
    }
    try {
      const storedStation = localStorage.getItem(NURSE_SESSION.station);
      if (storedStation && NURSE_STATION_OPTIONS.includes(storedStation)) {
        setStation(storedStation);
      }
    } catch {
      /* ignore */
    }
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    const u = String(username ?? "").trim().toLowerCase();
    if (!u || !password) {
      setError("Enter username and password.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/nurse/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password }),
      });
      if (!response.ok) {
        setError("Invalid username or password.");
        return;
      }
      const data = await response.json();
      const token = data.token;
      const nurse = data.nurse;
      if (!token || !nurse) {
        setError("Unexpected response from server.");
        return;
      }
      localStorage.setItem(NURSE_SESSION.token, token);
      localStorage.setItem(NURSE_SESSION.name, nurse.displayName || u);
      localStorage.setItem(NURSE_SESSION.username, nurse.username || u);
      localStorage.removeItem(NURSE_SESSION.loggedIn);
      localStorage.removeItem(NURSE_SESSION.staffId);
      localStorage.setItem(NURSE_SESSION.station, station);
      localStorage.setItem(NURSE_SESSION.status, "on-duty");
      setWelcomeName(nurse.displayName || nurse.username || u);
      setSuccess(true);
      setTimeout(() => router.replace("/dashboard"), 900);
    } catch {
      setError("Could not reach the server. Is the API running?");
    } finally {
      setSaving(false);
    }
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .nl-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0ede8;
          padding: 2rem 1rem;
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
        }
        .nl-shell {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 860px;
          min-height: 560px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.14);
        }
        @media (max-width: 640px) {
          .nl-shell { grid-template-columns: 1fr; }
          .nl-panel-left { display: none; }
        }

        /* Left panel */
        .nl-panel-left {
          background: #0a1628;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 2rem;
        }
        .nl-brand { display: flex; align-items: center; gap: 11px; }
        .nl-brand-icon {
          width: 38px; height: 38px;
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .nl-brand-name {
          font-size: 15px; font-weight: 600;
          color: #fff; letter-spacing: -0.01em;
        }
        .nl-brand-tag {
          font-size: 11px; color: rgba(255,255,255,0.38);
          letter-spacing: 0.03em; margin-top: 1px;
        }
        .nl-panel-body { flex: 1; }
        .nl-shift-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.07);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 20px; padding: 5px 12px;
          font-size: 11px; color: rgba(255,255,255,0.55);
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.04em; margin-bottom: 1.25rem;
        }
        .nl-shift-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          animation: nl-pulse 2s infinite;
        }
        @keyframes nl-pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        .nl-headline {
          font-size: 24px; font-weight: 500; color: #fff;
          line-height: 1.3; letter-spacing: -0.02em; margin: 0 0 0.75rem;
        }
        .nl-sub {
          font-size: 13px; color: rgba(255,255,255,0.42);
          line-height: 1.65; margin: 0;
        }
        .nl-stats { display: flex; gap: 10px; }
        .nl-stat {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 12px 14px;
        }
        .nl-stat-num {
          font-size: 22px; font-weight: 500; color: #fff;
          font-family: 'IBM Plex Mono', monospace; letter-spacing: -0.02em;
        }
        .nl-stat-label {
          font-size: 11px; color: rgba(255,255,255,0.38);
          margin-top: 2px; text-transform: uppercase; letter-spacing: 0.06em;
        }

        /* Right panel */
        .nl-panel-right {
          background: #fff;
          padding: 2.75rem 2.5rem;
          display: flex; flex-direction: column; justify-content: center;
        }
        .nl-form-title {
          font-size: 20px; font-weight: 500; color: #111;
          letter-spacing: -0.02em; margin: 0 0 4px;
        }
        .nl-form-sub { font-size: 13px; color: #6b7280; margin: 0 0 1.75rem; }
        .nl-error {
          font-size: 13px; color: #b91c1c;
          background: #fef2f2; border: 0.5px solid #fca5a5;
          border-radius: 8px; padding: 9px 12px; margin-bottom: 1rem;
        }
        .nl-fields {
          display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;
        }
        .nl-field { display: flex; flex-direction: column; gap: 5px; }
        .nl-label {
          font-size: 11px; font-weight: 500; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .nl-input-wrap { position: relative; }
        .nl-input-icon {
          position: absolute; left: 11px; top: 50%;
          transform: translateY(-50%);
          color: #9ca3af; pointer-events: none;
          display: flex; align-items: center;
        }
        .nl-input {
          width: 100%; height: 40px;
          border: 0.5px solid #d1d5db; border-radius: 8px;
          background: #f9fafb; color: #111;
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          font-size: 13px; padding: 0 12px 0 36px;
          outline: none; box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .nl-input:focus {
          border-color: #6b7280;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }
        .nl-input.mono {
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.04em;
        }
        .nl-select {
          width: 100%; height: 40px;
          border: 0.5px solid #d1d5db; border-radius: 8px;
          background: #f9fafb; color: #111;
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          font-size: 13px; padding: 0 36px 0 12px;
          outline: none; box-sizing: border-box; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
        }
        .nl-btn {
          width: 100%; height: 42px;
          background: #0a1628; border: none; border-radius: 8px;
          color: #fff; font-family: 'IBM Plex Sans', system-ui, sans-serif;
          font-size: 14px; font-weight: 500; cursor: pointer;
          letter-spacing: 0.01em; transition: opacity 0.15s;
          margin-bottom: 0.75rem;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .nl-btn:hover:not(:disabled) { opacity: 0.88; }
        .nl-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .nl-footer { font-size: 11px; color: #9ca3af; text-align: center; }
        .nl-spinner {
          width: 13px; height: 13px;
          border: 1.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: nl-spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes nl-spin { to { transform: rotate(360deg); } }

        /* Success state */
        .nl-success {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; gap: 12px; flex: 1;
        }
        .nl-success-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: #0a1628;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .nl-success-title {
          font-size: 17px; font-weight: 500;
          color: #111; letter-spacing: -0.01em;
        }
        .nl-success-sub { font-size: 13px; color: #6b7280; }
      `}</style>

      <div className="nl-page">
        <div className="nl-shell">
          <div className="nl-panel-left">
            <div className="nl-brand">
              <div className="nl-brand-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.25" />
                  <path d="M12 8v8M8 12h8" stroke="rgba(255,255,255,0.9)" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="nl-brand-name">TriageOS</div>
                <div className="nl-brand-tag">Clinical operations</div>
              </div>
            </div>

            <div className="nl-panel-body">
              <div className="nl-shift-badge">
                <span className="nl-shift-dot" />
                SHIFT ACTIVE — 07:00–19:00
              </div>
              <h1 className="nl-headline">{greeting}.<br />Clock in to your station.</h1>
              <p className="nl-sub">
                Sign in to access the patient queue, triage tools, and shift
                data for your workstation.
              </p>
            </div>

            <div className="nl-stats">
              <div className="nl-stat">
                <div className="nl-stat-num">24</div>
                <div className="nl-stat-label">Active patients</div>
              </div>
              <div className="nl-stat">
                <div className="nl-stat-num">6</div>
                <div className="nl-stat-label">On duty now</div>
              </div>
            </div>
          </div>

          <div className="nl-panel-right">
            {success ? (
              <div className="nl-success" role="status" aria-live="polite">
                <div className="nl-success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" width={24} height={24} aria-hidden>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="nl-success-title">
                  Welcome back, {welcomeName}
                </div>
                <div className="nl-success-sub">
                  Clocked in to {station} · Redirecting to dashboard…
                </div>
              </div>
            ) : (
              <>
                <h2 className="nl-form-title">Nurse sign-in</h2>
                <p className="nl-form-sub">
                  Sign in with your assigned username and password.
                </p>

                {error && (
                  <div className="nl-error" role="alert">{error}</div>
                )}

                <form onSubmit={submit} style={{ display: "contents" }}>
                  <div className="nl-fields">

                    <div className="nl-field">
                      <label className="nl-label" htmlFor="nl-username">Username</label>
                      <div className="nl-input-wrap">
                        <span className="nl-input-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width={16} height={16} aria-hidden>
                            <rect x="3" y="4" width="18" height="16" rx="2"/>
                            <path d="M9 10h6M9 14h4"/>
                          </svg>
                        </span>
                        <input
                          id="nl-username"
                          className="nl-input mono"
                          type="text"
                          placeholder="nurse"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          autoComplete="username"
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div className="nl-field">
                      <label className="nl-label" htmlFor="nl-password">Password</label>
                      <div className="nl-input-wrap">
                        <span className="nl-input-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width={16} height={16} aria-hidden>
                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </span>
                        <input
                          id="nl-password"
                          className="nl-input"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div className="nl-field">
                      <label className="nl-label" htmlFor="nl-station">Workstation / floor</label>
                      <select
                        id="nl-station"
                        className="nl-select"
                        value={station}
                        onChange={(e) => setStation(e.target.value)}
                        disabled={saving}
                      >
                        {NURSE_STATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  <button type="submit" className="nl-btn" disabled={saving}>
                    {saving ? (
                      <><span className="nl-spinner" /> Signing in…</>
                    ) : (
                      "Enter dashboard"
                    )}
                  </button>
                </form>

                <p className="nl-footer">
                  Accounts are created on the server. Ask your administrator if you need access.
                </p>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
