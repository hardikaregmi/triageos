export default function AboutPage() {
  return (
    <section className="aboutWrap pageContainer">
      <section className="glassPanel aboutPanel panelPaddingLg sectionContainer">
        <div className="sectionHeader">
          <p className="sectionLabel">About Triage</p>
        </div>
        <h1>What triage means in hospital operations</h1>
        <p>
          Triage is the process of quickly evaluating patients to determine who needs immediate
          care and who can safely wait. It helps clinical teams prioritize scarce resources and
          reduce treatment delays during high-demand periods.
        </p>
      </section>

      <section className="glassPanel aboutPanel panelPaddingLg sectionContainer">
        <div className="sectionHeader">
          <p className="sectionLabel">How TriageOS Helps</p>
        </div>
        <h2>Faster decisions, clearer coordination</h2>
        <p>
          TriageOS brings patient risk, confidence, and staffing context into one shared command
          view. Care teams can identify high-risk cases, monitor doctor availability, and align on
          next actions without switching tools.
        </p>
      </section>

      <style jsx>{`
        .aboutWrap {
          gap: 22px;
        }

        .aboutPanel {
          padding: 34px 36px;
        }

        h1,
        h2 {
          margin: 0;
          color: #eef6ff;
          font-size: 42px;
          line-height: 1.15;
        }

        h2 {
          font-size: 36px;
        }

        p {
          margin: 16px 0 0;
          color: #c8d9f6;
          font-size: 22px;
          line-height: 1.52;
          max-width: 1100px;
        }
      `}</style>
    </section>
  );
}
