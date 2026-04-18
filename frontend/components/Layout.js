import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAppRole } from "../contexts/AppRoleContext";
import { NURSE_SESSION, NURSE_STATION_OPTIONS, normalizeNurseStaffId } from "../constants/nurseSession";

const API_BASE = "http://localhost:8080";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    href: "/doctors",
    label: "Doctors",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "About",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
];

function greetingForHour(h) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function titleForRoute(pathname) {
  if (pathname === "/dashboard") return "Hospital overview";
  if (pathname === "/doctors") return "Physician roster";
  if (pathname === "/about") return "About";
  return "TriageOS";
}

function subtitleForRoute(pathname) {
  if (pathname === "/") return "Shortcuts to queue, roster, and reference material.";
  if (pathname === "/dashboard") return "Today's patient flow and staffing at a glance.";
  if (pathname === "/doctors") return "Who is available and how patients are distributed.";
  if (pathname === "/about") return "Background on triage in acute care.";
  return "";
}

export default function Layout({ children }) {
  const router = useRouter();
  const { role: appRole, hospitalId } = useAppRole();
  const [now, setNow] = useState(() => new Date());
  const [nurseName, setNurseName] = useState("R. Morgan");
  const [nurseStaffId, setNurseStaffId] = useState("N-0104");
  const [station, setStation] = useState(NURSE_STATION_OPTIONS[1]);
  const [nurseStatus, setNurseStatus] = useState("on-duty");
  const [systemStatus, setSystemStatus] = useState("active");
  const [systemStatusText, setSystemStatusText] = useState("System active");
  const [systemStatusDetail, setSystemStatusDetail] = useState("Checking backend status...");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function refreshSystemStatus() {
      try {
        const response = await fetch(`${API_BASE}/dashboard/summary`);
        if (!response.ok) {
          throw new Error("Failed request");
        }
        const summary = await response.json();
        if (cancelled) return;
        const availableDoctors = Number(summary.availableDoctors ?? 0);
        if (availableDoctors > 0) {
          setSystemStatus("active");
          setSystemStatusText("System active");
          setSystemStatusDetail(`${availableDoctors} doctors available`);
        } else {
          setSystemStatus("warning");
          setSystemStatusText("System degraded");
          setSystemStatusDetail("No doctors currently available");
        }
      } catch {
        if (cancelled) return;
        setSystemStatus("degraded");
        setSystemStatusText("System unavailable");
        setSystemStatusDetail("Backend connection issue");
      }
    }

    refreshSystemStatus();
    const interval = setInterval(refreshSystemStatus, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    try {
      const n = localStorage.getItem(NURSE_SESSION.name);
      const id = localStorage.getItem(NURSE_SESSION.staffId);
      const s = localStorage.getItem(NURSE_SESSION.station);
      const st = localStorage.getItem(NURSE_SESSION.status);
      if (n) setNurseName(n);
      if (id) setNurseStaffId(normalizeNurseStaffId(id));
      if (s && NURSE_STATION_OPTIONS.includes(s)) setStation(s);
      if (st === "on-duty" || st === "break" || st === "offline") setNurseStatus(st);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(NURSE_SESSION.name, nurseName);
    } catch {
      /* ignore */
    }
  }, [nurseName]);

  useEffect(() => {
    try {
      localStorage.setItem(NURSE_SESSION.staffId, nurseStaffId);
    } catch {
      /* ignore */
    }
  }, [nurseStaffId]);

  useEffect(() => {
    try {
      localStorage.setItem(NURSE_SESSION.station, station);
    } catch {
      /* ignore */
    }
  }, [station]);

  useEffect(() => {
    try {
      localStorage.setItem(NURSE_SESSION.status, nurseStatus);
    } catch {
      /* ignore */
    }
  }, [nurseStatus]);

  const statusBadgeLabel =
    nurseStatus === "on-duty" ? "On Duty" : nurseStatus === "break" ? "Break" : "Offline";

  const headerTitle = useMemo(() => {
    const path = router.pathname;
    if (path === "/" || path === "/dashboard") {
      return `${greetingForHour(now.getHours())}, Nurse ID ${nurseStaffId}`;
    }
    return titleForRoute(path);
  }, [router.pathname, now, nurseStaffId]);

  const headerSub =
    router.pathname === "/" || router.pathname === "/dashboard"
      ? `${subtitleForRoute(router.pathname)} Signed in as ${nurseName || "Nurse"}.`
      : subtitleForRoute(router.pathname);

  const timeStr = now.toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  function logoutNurseSession() {
    try {
      localStorage.removeItem(NURSE_SESSION.loggedIn);
      localStorage.removeItem(NURSE_SESSION.name);
      localStorage.removeItem(NURSE_SESSION.staffId);
      localStorage.removeItem(NURSE_SESSION.station);
      localStorage.removeItem(NURSE_SESSION.status);
    } catch {
      /* ignore */
    }
    router.replace("/nurse-login");
  }

  return (
    <div className="medShell" data-app-role={appRole} data-hospital-id={hospitalId}>
      <aside className="medSidebar">
        <div className="medSidebarBrand">
          <span className="medLogoMark" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div>
            <div className="medLogoText">TriageOS</div>
            <p className="medLogoSub">AI command center</p>
          </div>
        </div>

        <nav className="medNav" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`medNavLink ${router.pathname === item.href ? "active" : ""}`}
            >
              <span className="medNavIcon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="medSidebarFooter">
          <div className="medStatusCard">
            <p className="medStatusCardTitle">
              <strong>{systemStatusText}</strong>
            </p>
            <div className="medStatusRow">
              <span className={`medStatusDot ${systemStatus}`} />
              <span>{systemStatusDetail}</span>
            </div>
          </div>

          <section className="medStaffPanel" aria-label="Nurse station">
            <header className="medStaffPanelBar">
              <h2 className="medStaffPanelHeading">Nurse ID {nurseStaffId}</h2>
              <div className="medStaffPresence" aria-live="polite">
                <span
                  className={`medStaffPresenceLed medStaffPresenceLed--${nurseStatus}`}
                  title={`Presence: ${statusBadgeLabel}`}
                  aria-hidden
                />
                <span className="medStaffPresenceText">{statusBadgeLabel}</span>
              </div>
            </header>

            <div className="medStaffPanelBody" role="group" aria-label="Workstation and presence">
              <div className="medStaffField">
                <label className="medStaffFieldLabel" htmlFor="staff-station">
                  Workstation
                </label>
                <select
                  id="staff-station"
                  className="uiSelect medStaffSelect"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                >
                  {NURSE_STATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="medStaffField">
                <label className="medStaffFieldLabel" htmlFor="staff-nurse-id">
                  Nurse ID
                </label>
                <input
                  id="staff-nurse-id"
                  className="uiInput medStaffInput"
                  type="text"
                  value={nurseStaffId}
                  onChange={(e) => setNurseStaffId(normalizeNurseStaffId(e.target.value))}
                  placeholder="N-0104"
                  autoComplete="off"
                />
              </div>

              <div className="medStaffField">
                <label className="medStaffFieldLabel" htmlFor="staff-nurse-name">
                  Nurse name (secondary)
                </label>
                <input
                  id="staff-nurse-name"
                  className="uiInput medStaffInput"
                  type="text"
                  value={nurseName}
                  onChange={(e) => setNurseName(e.target.value)}
                  placeholder="Name for intake and charting"
                  autoComplete="name"
                />
              </div>

              <div className="medStaffField">
                <label className="medStaffFieldLabel" htmlFor="staff-status">
                  Duty status
                </label>
                <select
                  id="staff-status"
                  className="uiSelect medStaffSelect"
                  value={nurseStatus}
                  onChange={(e) => setNurseStatus(e.target.value)}
                >
                  <option value="on-duty">On Duty</option>
                  <option value="break">Break</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <div className="medStaffActions">
              <button type="button" className="primaryButton medStaffActionPrimary" onClick={() => router.push("/dashboard?intake=1")}>
                New patient intake
              </button>
              <Link href="/dashboard" className="medStaffLinkSecondary">
                Open dashboard
              </Link>
              <button type="button" className="medStaffLinkSecondary medStaffLinkButton" onClick={logoutNurseSession}>
                Logout
              </button>
            </div>
          </section>
        </div>
      </aside>

      <div className="medWorkspace">
        <header className="medPageHeader">
          <div>
            <h1 className="medPageTitle">{headerTitle}</h1>
            <p className="medPageSub">{headerSub}</p>
          </div>
          <div className="medPageHeaderMeta">
            <time dateTime={now.toISOString()}>{timeStr}</time>
          </div>
        </header>

        <main className="medPageBody">{children}</main>

        <footer className="medAppFooter">
          <p className="medAppFooterName">TriageOS</p>
          <p className="medAppFooterTag">AI hospital operations platform</p>
        </footer>
      </div>
    </div>
  );
}
