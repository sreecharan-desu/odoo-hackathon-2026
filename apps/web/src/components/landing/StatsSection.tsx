export function StatsSection() {
  const stats = [
    { val: "500+", label: "Cities Worldwide" },
    { val: "10K+", label: "Active Vehicles" },
    { val: "5M+", label: "Daily Trips" },
    { val: "99.9%", label: "Platform Uptime" },
  ];

  return (
    <section className="container" style={{ paddingBottom: "100px" }}>
      <div 
        className="glass-panel" 
        style={{ 
          display: "flex", flexWrap: "wrap", justifyContent: "space-around", 
          padding: "60px 24px", background: "rgba(11, 22, 34, 0.8)", borderTop: "1px solid var(--accent-cyan)"
        }}
      >
        {stats.map((stat, i) => (
          <div key={i} style={{ textAlign: "center", padding: "16px" }}>
            <div className="text-gradient" style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: "8px" }}>
              {stat.val}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
