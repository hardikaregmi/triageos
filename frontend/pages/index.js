import Link from "next/link";

export default function HomePage() {
  return (
    <div className="pageContainer homePage">
      <section className="medCard panelPaddingLg">
        <p className="sectionLabel">Start here</p>
        <h2 className="homeHeading">Triage queue and roster</h2>
        <p className="homeBody">
          Open the dashboard to view patients, run triage, and see who is on duty. Use the sidebar for other modules.
        </p>
        <p style={{ margin: "14px 0 0" }}>
          <Link href="/dashboard" className="primaryButton" style={{ display: "inline-flex", alignItems: "center" }}>
            Dashboard
          </Link>
        </p>
      </section>

      <nav className="homeLinks medCard panelPaddingLg" aria-label="Modules">
        <p className="sectionLabel">Modules</p>
        <ul className="homeLinkList">
          <li>
            <Link href="/dashboard">Patient queue & triage</Link>
          </li>
          <li>
            <Link href="/doctors">Physician roster</Link>
          </li>
          <li>
            <Link href="/about">About triage</Link>
          </li>
        </ul>
      </nav>

      <style jsx>{`
        .homeHeading {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .homeBody {
          margin: 0;
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
          max-width: 42rem;
        }
        .homeLinkList {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .homeLinkList a {
          font-size: 14px;
          color: var(--blue-muted);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .homeLinkList a:hover {
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
