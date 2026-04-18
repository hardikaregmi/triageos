export default function AboutPage() {
  return (
    <div className="pageContainer aboutPage">
      <section className="medCard panelPaddingLg">
        <p className="sectionLabel">Clinical context</p>
        <h2 className="aboutHeading">Triage in hospital operations</h2>
        <p className="aboutBody">
          Triage is used to evaluate patients and decide who needs immediate attention versus who can wait safely. It
          helps teams use limited resources when patient volume is high.
        </p>
      </section>

      <section className="medCard panelPaddingLg">
        <p className="sectionLabel">This application</p>
        <h2 className="aboutHeading">Purpose</h2>
        <p className="aboutBody">
          TriageOS is an operational view for charge nurses and admins: intake data, triage results, and physician
          availability in one place so handoffs stay clear.
        </p>
      </section>

      <style jsx>{`
        .aboutHeading {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .aboutBody {
          margin: 0;
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.55;
          max-width: 40rem;
        }
      `}</style>
    </div>
  );
}
