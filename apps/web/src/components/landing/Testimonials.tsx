function QuoteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-cyan)" opacity="0.2">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.036v3c0 1 1 2 2 2z"></path>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h1c0 1 0 1 0 2v1c0 1-1 2-2 2s-1 .008-1 1.036v3c0 1 1 2 2 2z"></path>
    </svg>
  );
}

export function Testimonials() {
  const reviews = [
    { quote: "TransitOps replaced three different legacy systems we were using. The real-time tracking alone saved us 15% in operational delays.", name: "Sarah Jenkins", role: "VP of Operations, MetroTransit", company: "MetroTransit" },
    { quote: "The dashboard is incredibly intuitive. Our dispatchers learned it in a day, and the driver compliance tracking is flawless.", name: "Marcus Chen", role: "Fleet Manager, CityRide", company: "CityRide" },
    { quote: "We've scaled from 50 to 200 buses with zero growing pains thanks to their smart scheduling and predictive maintenance.", name: "Elena Rodriguez", role: "Director of Transit, NovaLines", company: "NovaLines" }
  ];

  return (
    <section id="use-cases" className="container" style={{ paddingTop: "100px", paddingBottom: "100px" }}>
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h2 style={{ fontSize: "3rem", fontWeight: 700, margin: "0 0 16px 0" }}>Trusted by <span className="text-accent">innovators</span>.</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto" }}>
          See how leading transportation networks are modernizing their fleets with TransitOps.
        </p>
      </div>

      <div className="grid-3">
        {reviews.map((rev, i) => (
          <div key={i} className="glass-panel" style={{ padding: "40px 32px", display: "flex", flexDirection: "column" }}>
            <QuoteIcon />
            <p style={{ fontSize: "16px", color: "var(--text-main)", lineHeight: 1.6, margin: "24px 0", flex: 1 }}>
              "{rev.quote}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "16px", borderTop: "1px solid var(--glass-border)", paddingTop: "24px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--accent-cyan)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {rev.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px" }}>{rev.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{rev.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
