export default function AboutPage() {
  return (
    <div className="pageContainer aboutPage">
      <header className="aboutIntro">
        <h1 className="aboutProductTitle">TriageOS</h1>
        <p className="aboutTagline">AI-assisted triage and monitoring for modern hospital operations.</p>
        <p className="aboutIntroSupport">
          It helps nurses prioritize patients, track follow-ups, and coordinate care across the team.
        </p>
      </header>

      <div className="aboutCardGrid">
        <section className="medCard aboutCard">
          <p className="sectionLabel">Clinical context</p>
          <h2 className="aboutHeading">Triage in hospital operations</h2>
          <p className="aboutBody">
            Triage is used to evaluate patients and decide who needs immediate attention versus who can wait safely. It
            helps teams use limited resources when patient volume is high.
          </p>
        </section>

        <section className="medCard aboutCard">
          <p className="sectionLabel">This application</p>
          <h2 className="aboutHeading">Purpose</h2>
          <p className="aboutBody">
            TriageOS is an operational view for charge nurses and admins: intake data, triage results, and physician
            availability in one place so handoffs stay clear.
          </p>
        </section>
      </div>

      <section className="aboutFeatures" aria-labelledby="aboutFeaturesHeading">
        <div className="aboutFeaturesHead">
          <h2 id="aboutFeaturesHeading" className="aboutHeading">
            What TriageOS does
          </h2>
        </div>

        <div className="aboutFeatureGrid">
          <article className="medCard aboutCard aboutFeatureCard">
            <h3 className="aboutFeatureTitle">AI triage insights</h3>
            <p className="aboutBody">
              Surfaces high-risk patients early using vitals, intake data, and chief complaint signals.
            </p>
          </article>

          <article className="medCard aboutCard aboutFeatureCard">
            <h3 className="aboutFeatureTitle">Real-time tracking</h3>
            <p className="aboutBody">
              Monitors patient status and check-in intervals so follow-ups never slip through the queue.
            </p>
          </article>

          <article className="medCard aboutCard aboutFeatureCard">
            <h3 className="aboutFeatureTitle">Doctor alerts</h3>
            <p className="aboutBody">
              Notify on-duty physicians instantly with priority and context attached to the patient.
            </p>
          </article>
        </div>
      </section>

      <style jsx>{`
        .aboutIntro {
          margin: 0 0 6px;
          padding: 0 0 4px;
          max-width: 60rem;
        }
        .aboutProductTitle {
          margin: 0 0 10px;
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.03em;
          line-height: 1.18;
        }
        .aboutTagline {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 500;
          color: var(--blue-muted);
          line-height: 1.45;
        }
        .aboutIntroSupport {
          margin: 0;
          font-size: 14.5px;
          color: var(--text-muted);
          line-height: 1.55;
        }
        .aboutCardGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 18px;
        }
        @media (max-width: 820px) {
          .aboutCardGrid {
            grid-template-columns: 1fr;
          }
        }
        .aboutCard {
          padding: 22px 26px;
          height: 100%;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(16, 52, 80, 0.05), 0 4px 14px rgba(17, 56, 89, 0.05);
        }
        .aboutCard :global(.sectionLabel) {
          margin-bottom: 8px;
          font-size: 11.5px;
        }
        .aboutHeading {
          margin: 0 0 10px;
          font-size: 18px;
          font-weight: 650;
          color: var(--text);
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
        .aboutBody {
          margin: 0;
          font-size: 14.5px;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .aboutFeatures {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .aboutFeaturesHead {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 2px;
        }
        .aboutFeaturesHead :global(.sectionLabel) {
          font-size: 11.5px;
        }
        .aboutFeaturesHead .aboutHeading {
          margin: 0;
          font-size: 20px;
        }
        .aboutFeatureGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 980px) {
          .aboutFeatureGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .aboutFeatureGrid {
            grid-template-columns: 1fr;
          }
        }
        .aboutFeatureCard {
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .aboutFeatureTitle {
          margin: 0;
          font-size: 16px;
          font-weight: 650;
          color: var(--text);
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
      `}</style>
    </div>
  );
}
