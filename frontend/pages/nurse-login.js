import { useState } from "react";
import { useRouter } from "next/router";
import { API_BASE } from "../lib/api";
import { NURSE_SESSION } from "../constants/nurseSession";
import { BRAND_LOGO_SRC } from "../constants/branding";

export default function NurseLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

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
      localStorage.removeItem(NURSE_SESSION.station);
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
        .nl-page {
          min-height: 100vh;
          min-height: 100dvh;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-page);
          /* Tight gutters; extra bottom padding nudges the card slightly above true center */
          padding: 4px 8px min(9vh, 56px);
          font-family: var(--font);
        }
        .nl-shell {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: min(940px, calc(100vw - 16px));
          min-height: min(580px, calc(100dvh - 20px));
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-md);
          background: var(--bg-elevated);
        }
        @media (max-width: 640px) {
          .nl-shell {
            grid-template-columns: 1fr;
            width: min(100%, calc(100vw - 16px));
            min-height: min(calc(100dvh - 16px), 640px);
          }
          .nl-panel-left { display: none; }
        }

        .nl-panel-left {
          padding: 1.25rem 1.45rem 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          min-height: 0;
        }
        .nl-leftColumn {
          max-width: 420px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .nl-leftZoneTop {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .nl-loginLogo {
          display: block;
          height: 42px;
          width: auto;
          max-width: 148px;
          margin-bottom: 8px;
          object-fit: contain;
          object-position: left center;
        }
        .nl-brandText {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .nl-brand-name {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.45;
        }
        .nl-brand-tag {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.04em;
          line-height: 1.45;
        }
        .nl-leftZoneMiddle {
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }
        .nl-headline {
          font-size: 1.28rem;
          font-weight: 500;
          color: #fff;
          line-height: 1.5;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .nl-headlineLead {
          font-weight: 500;
        }
        .nl-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          line-height: 1.55;
          margin: 12px 0 0;
          max-width: 420px;
        }

        .nl-panel-right {
          background: var(--bg-elevated);
          padding: 1.3rem 1.45rem 1rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 0;
        }
        .nl-form-title {
          font-size: 1.05rem; font-weight: 600; color: var(--text);
          letter-spacing: -0.02em; margin: 0 0 3px;
        }
        .nl-form-sub {
          font-size: 12px; color: var(--text-muted);
          margin: 0 0 0.85rem;
          line-height: 1.45;
        }
        .nl-error {
          font-size: 12px; color: var(--danger-text);
          background: var(--danger-soft);
          border: 1px solid #f0d6d6;
          border-radius: var(--radius-sm);
          padding: 8px 10px;
          margin-bottom: 0.75rem;
        }
        .nl-fields {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          margin-bottom: 0.75rem;
        }
        .nl-field { display: flex; flex-direction: column; gap: 4px; }
        .nl-label {
          font-size: 10px; font-weight: 600; color: var(--text-hint);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .nl-input-wrap { position: relative; }
        .nl-input-icon {
          position: absolute; left: 10px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-hint);
          pointer-events: none;
          display: flex; align-items: center;
        }
        .nl-input {
          width: 100%; height: 36px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--bg-subtle);
          color: var(--text);
          font-family: var(--font);
          font-size: 13px;
          padding: 0 11px 0 34px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .nl-input:focus {
          border-color: var(--border-strong);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .nl-input.mono {
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
        }
        .nl-btn {
          width: 100%; height: 36px;
          background: var(--accent);
          border: 1px solid var(--accent);
          border-radius: var(--radius-sm);
          color: #fff;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: background 0.15s, border-color 0.15s;
          margin-bottom: 0.35rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .nl-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          border-color: var(--accent-hover);
        }
        .nl-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .nl-footer {
          font-size: 10px;
          color: var(--text-hint);
          text-align: center;
          line-height: 1.38;
          margin: 0;
          padding-top: 1px;
          opacity: 0.78;
        }
        .nl-spinner {
          width: 13px; height: 13px;
          border: 1.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: nl-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes nl-spin { to { transform: rotate(360deg); } }

        .nl-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 8px;
          flex: 1;
          padding: 0.25rem 0;
        }
        .nl-success-icon {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
        }
        .nl-success-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .nl-success-sub { font-size: 12px; color: var(--text-muted); }
      `}</style>

      <div className="nl-page">
        <div className="nl-shell">
          <div className="nl-panel-left">
            <div className="nl-leftColumn">
              <div className="nl-leftZoneTop">
                <img
                  className="nl-loginLogo"
                  src={BRAND_LOGO_SRC}
                  alt="TriageOS"
                  width={148}
                  height={42}
                />
                <div className="nl-brandText">
                  <div className="nl-brand-name">TriageOS</div>
                  <div className="nl-brand-tag">Clinical operations</div>
                </div>
              </div>

              <div className="nl-leftZoneMiddle">
                <h1 className="nl-headline">
                  {greeting}.<br />
                  <span className="nl-headlineLead">Sign in to access the patient dashboard.</span>
                </h1>
                <p className="nl-sub">
                  View the triage queue, patient intake, and monitoring tools after you sign in.
                </p>
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
                <div className="nl-success-sub">Redirecting to dashboard…</div>
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
