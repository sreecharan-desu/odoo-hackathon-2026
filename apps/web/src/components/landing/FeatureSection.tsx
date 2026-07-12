function FeatureIcon({ type }: { type: string }) {
  return (
    <div style={{
      width: "44px", height: "44px", borderRadius: "10px",
      background: "var(--bg-secondary)",
      border: "1px solid var(--glass-border)",
      color: "var(--text-main)",
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: "20px",
      flexShrink: 0,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {type === "fleet" && <><path d="M4 14.5A2.5 2.5 0 0 0 6.5 17h11a2.5 2.5 0 0 0 2.5-2.5V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6.5Z"/><path d="M4 11h16"/></>}
        {type === "driver" && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
        {type === "dispatch" && <><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></>}
        {type === "maintenance" && <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>}
        {type === "analytics" && <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}
        {type === "rbac" && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>}
      </svg>
    </div>
  );
}

export function FeatureSection() {
  const features = [
    {
      title: "Vehicle registry",
      desc: "Track Available, On Trip, In Shop, and Retired assets with load capacity, odometer, and acquisition cost.",
      icon: "fleet",
      tag: "Fleet",
    },
    {
      title: "Driver compliance",
      desc: "License number, category, expiry, and safety score — expired or suspended drivers cannot be assigned.",
      icon: "driver",
      tag: "Safety",
    },
    {
      title: "Trip dispatch",
      desc: "Draft → Dispatched → Completed / Cancelled. Only available vehicles and drivers enter the pool.",
      icon: "dispatch",
      tag: "Ops",
    },
    {
      title: "Shop & maintenance",
      desc: "Open a work order and the vehicle moves In Shop — automatically removed from dispatch options.",
      icon: "maintenance",
      tag: "Shop",
    },
    {
      title: "Fuel, expenses & ROI",
      desc: "Log fuel and other costs in ₹. Analytics shows efficiency, utilization, and vehicle ROI with CSV + PDF export.",
      icon: "analytics",
      tag: "Finance",
    },
    {
      title: "Four operator desks",
      desc: "Fleet Manager, Driver, Safety Officer, and Financial Analyst — role-scoped nav from the account, not a login picker.",
      icon: "rbac",
      tag: "RBAC",
    },
  ];

  return (
    <section id="features" style={{ paddingTop: "100px", paddingBottom: "100px" }}>
      <div className="container" style={{ marginBottom: "56px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "16px" }}>
          <span style={{
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--text-muted)",
            border: "1px solid var(--glass-border)", borderRadius: "100px",
            padding: "4px 12px",
          }}>
            What ships in the product
          </span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", flexWrap: "wrap", gap: "16px" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)", fontWeight: 700, margin: 0, letterSpacing: "-0.02em", maxWidth: "520px" }}>
              Built for real transport desks — not slideware.
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "340px", margin: 0, lineHeight: 1.6 }}>
              Every capability below is wired to FastAPI + PostgreSQL with service-layer validation.
            </p>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--glass-border)" }} />

      <div className="container feature-newspaper-grid">
        {features.map((feat) => (
          <div
            key={feat.title}
            className="feature-cell"
            style={{ padding: "36px 32px", display: "flex", flexDirection: "column", transition: "background 0.2s ease" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <FeatureIcon type={feat.icon} />
              <span style={{
                fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "var(--text-muted)",
                border: "1px solid var(--glass-border)", borderRadius: "4px",
                padding: "3px 7px", marginTop: "4px",
              }}>
                {feat.tag}
              </span>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 10px 0", letterSpacing: "-0.01em" }}>{feat.title}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.65, margin: 0 }}>
              {feat.desc}
            </p>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--glass-border)" }} />
    </section>
  );
}
