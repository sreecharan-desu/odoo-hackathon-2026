function FeatureIcon({ type }: { type: string }) {
  return (
    <div style={{
      width: "48px", height: "48px", borderRadius: "12px",
      background: "rgba(22, 230, 216, 0.1)", color: "var(--accent-cyan)",
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: "20px"
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {type === 'fleet' && <><path d="M4 14.5A2.5 2.5 0 0 0 6.5 17h11a2.5 2.5 0 0 0 2.5-2.5V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6.5Z"/><path d="M4 11h16"/></>}
        {type === 'gps' && <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}
        {type === 'driver' && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
        {type === 'route' && <><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></>}
        {type === 'maintenance' && <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>}
        {type === 'analytics' && <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}
      </svg>
    </div>
  );
}

export function FeatureSection() {
  const features = [
    { title: "Fleet Management", desc: "Monitor your entire fleet's health, status, and assignments in one centralized dashboard.", icon: "fleet" },
    { title: "Driver Management", desc: "Manage driver schedules, compliance, licenses, and performance metrics.", icon: "driver" },
    { title: "Route Planning", desc: "Optimize routes dynamically based on traffic, historical data, and conditions.", icon: "route" },
    { title: "Maintenance Alerts", desc: "Predictive alerts keep your vehicles on the road and reduce costly downtime.", icon: "maintenance" },
    { title: "Smart Scheduling", desc: "Automate trip dispatch and crew assignments across your entire operation.", icon: "analytics" },
    { title: "Passenger Analytics", desc: "Understand ridership trends, peak hours, and revenue metrics instantly.", icon: "analytics" },
  ];

  return (
    <section id="features" className="container" style={{ paddingTop: "100px", paddingBottom: "100px" }}>
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h2 style={{ fontSize: "3rem", fontWeight: 700, margin: "0 0 16px 0" }}>Everything you need to <span className="text-accent">scale</span>.</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto" }}>
          TransitOps provides a complete suite of tools to modernize your operations and reduce costs.
        </p>
      </div>

      <div className="grid-3">
        {features.map((feat, i) => (
          <div key={i} style={{
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              border: "1px solid var(--glass-border)",
              borderRadius: "12px",
              background: "var(--glass-bg)",
            }}>
            <FeatureIcon type={feat.icon} />
            <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 10px 0" }}>{feat.title}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
