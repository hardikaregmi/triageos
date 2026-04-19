import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAppRole } from "../contexts/AppRoleContext";
import { BRAND_LOGO_SRC } from "../constants/branding";
import { NURSE_SESSION, clearNurseSession } from "../constants/nurseSession";


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
  if (pathname === "/doctors") return "Doctors";
  if (pathname === "/about") return "About";
  return "TriageOS";
}

function subtitleForRoute(pathname) {
  if (pathname === "/") return "Shortcuts to queue, roster, and reference material.";
  if (pathname === "/dashboard") return "Today's patient flow and staffing at a glance.";
  if (pathname === "/doctors") return "Who is available and how patients are distributed.";
  if (pathname === "/about") return "What TriageOS is and why it exists.";
  return "";
}

export default function Layout({ children }) {
  const router = useRouter();
  const { role: appRole, hospitalId } = useAppRole();
  const [now, setNow] = useState(() => new Date());
  const [nurseUsername, setNurseUsername] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const user = localStorage.getItem(NURSE_SESSION.username);
      if (user) setNurseUsername(user);
    } catch {
      /* ignore */
    }
  }, []);

  const headerTitle = useMemo(() => {
    const path = router.pathname;
    if (path === "/" || path === "/dashboard") {
      return `${greetingForHour(now.getHours())}`;
    }
    return titleForRoute(path);
  }, [router.pathname, now]);

  const headerSub = subtitleForRoute(router.pathname);
  const isDashboard = router.pathname === "/dashboard";

  const timeStr = now.toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  function logoutNurseSession() {
    clearNurseSession();
    router.replace("/nurse-login");
  }

  return (
    <div className="medShell" data-app-role={appRole} data-hospital-id={hospitalId}>
      <aside className="medSidebar">
        <div className="medSidebarBrand">
          <span className="medLogoMark" aria-hidden>
            <img src={BRAND_LOGO_SRC} alt="" width={24} height={24} />
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
          <section className="medStaffPanel" aria-label="Account">
            <div className="medStaffPanelHead">
              <p className="medStaffWelcomeLabel">Welcome</p>
              <div className="medStaffIdRow" aria-live="polite">
                <span className="medStaffIdText">@{nurseUsername || "—"}</span>
                <span className="medStaffPresence">
                  <span className="medStaffPresenceLed medStaffPresenceLed--on-duty" title="On duty" aria-hidden />
                  <span className="medStaffPresenceText">On Duty</span>
                </span>
              </div>
            </div>

            <div className="medStaffActions">
              <button type="button" className="primaryButton medStaffActionPrimary" onClick={() => router.push("/dashboard?intake=1")}>
                New patient intake
              </button>
              <button type="button" className="medStaffLinkSecondary medStaffLinkButton" onClick={logoutNurseSession}>
                Logout
              </button>
            </div>
          </section>
        </div>
      </aside>

      <div className="medWorkspace">
        <header className={`medPageHeader${isDashboard ? " medPageHeader--dashboard" : ""}`}>
          <div className="medPageHeaderLead">
            <img
              className="medPageHeaderLogo"
              src={BRAND_LOGO_SRC}
              alt=""
              width={32}
              height={32}
            />
            <div>
              <h1 className="medPageTitle">{headerTitle}</h1>
              <p className="medPageSub">{headerSub}</p>
            </div>
          </div>
          <div className="medPageHeaderMeta">
            <time dateTime={now.toISOString()}>{timeStr}</time>
          </div>
        </header>

        <main className={`medPageBody${isDashboard ? " medPageBody--dashboard" : ""}`}>{children}</main>

        <footer className="medAppFooter">
          <p className="medAppFooterName">TriageOS</p>
          <p className="medAppFooterTag">AI hospital operations platform</p>
        </footer>
      </div>
    </div>
  );
}
