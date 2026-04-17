import Link from "next/link";

export default function HomePage() {
  return (
    <section className="homeWrap pageContainer">
      <section className="glassPanel heroPanel panelPaddingLg">
        <div className="sectionHeader">
          <p className="sectionLabel">Welcome</p>
        </div>
        <h1 className="heroTitle">Future-ready triage decisions in one calm command center.</h1>
        <p className="heroSub">
          TriageOS helps clinical teams prioritize risk, coordinate doctors, and act faster with clear data.
        </p>
        <Link href="/dashboard" className="ctaButton homeCta">
          Open Dashboard
        </Link>
      </section>

      <section className="featureGrid">
        <article className="glassPanel featureCard">
          <p className="sectionLabel">Risk Intelligence</p>
          <h2>Real-time triage flow</h2>
          <p>Analyze patients, classify risk, and keep high-priority cases visible first.</p>
        </article>
        <article className="glassPanel featureCard">
          <p className="sectionLabel">Care Coordination</p>
          <h2>Doctor-aware routing</h2>
          <p>View availability and assigned patients so teams can coordinate quickly and clearly.</p>
        </article>
        <article className="glassPanel featureCard">
          <p className="sectionLabel">Operations View</p>
          <h2>Single-screen control</h2>
          <p>Track total patients, high-risk count, and staffing readiness in one interface.</p>
        </article>
      </section>
      <style jsx>{`
        .homeWrap {
          gap: 24px;
        }

        .heroPanel {
          padding-bottom: 42px;
        }

        .heroTitle {
          margin: 0;
          max-width: 980px;
          font-size: 56px;
          line-height: 1.1;
          letter-spacing: 0.01em;
          color: #f4f9ff;
          text-shadow: 0 0 14px rgba(144, 218, 255, 0.2);
        }

        .heroSub {
          margin: 16px 0 0;
          max-width: 860px;
          font-size: 22px;
          line-height: 1.45;
          color: #c7d9f7;
        }

        .homeCta {
          margin-top: 26px;
          display: inline-flex;
          align-items: center;
        }

        .featureGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .featureCard {
          padding: 30px;
          min-height: 240px;
        }

        .featureCard h2 {
          margin: 0;
          font-size: 31px;
          color: #edf5ff;
        }

        .featureCard p {
          margin: 12px 0 0;
          font-size: 19px;
          color: #c6d8f7;
          line-height: 1.45;
        }

        @media (max-width: 1100px) {
          .featureGrid {
            grid-template-columns: 1fr;
          }

          .heroTitle {
            font-size: 42px;
          }
        }
      `}</style>
    </section>
  );
}
