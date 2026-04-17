import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/doctors", label: "Doctors" },
  { href: "/about", label: "About" },
];

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div className="appShell">
      <div className="ambientGlow ambientGlowA" />
      <div className="ambientGlow ambientGlowB" />
      <div className="ambientGrid" />

      <header className="glassPanel headerPanel">
        <div>
          <p className="brandName">TriageOS</p>
          <p className="brandSub">AI Hospital Command Center</p>
        </div>
        <nav className="topNav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`navLink ${router.pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="statusPill">
          <span className="statusDot" />
          System Active
        </p>
      </header>

      <main className="mainContent">{children}</main>

      <footer className="glassPanel footerPanel">
        <p className="footerTitle">TriageOS</p>
        <p className="footerTagline">Premium command center for hospital triage.</p>
        <p className="footerCopy">© 2026 TriageOS</p>
      </footer>
    </div>
  );
}
