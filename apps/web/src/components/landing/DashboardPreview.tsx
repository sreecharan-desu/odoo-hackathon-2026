function IconTemplate({ path }: { path: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path === 'dashboard' && <><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>}
      {path === 'routes'    && <><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></>}
      {path === 'fleet'     && <><path d="M4 14.5A2.5 2.5 0 0 0 6.5 17h11a2.5 2.5 0 0 0 2.5-2.5V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6.5Z"/><path d="M4 11h16"/></>}
      {path === 'drivers'   && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
      {path === 'schedules' && <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
      {path === 'analytics' && <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}
      {path === 'reports'   && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}
      {path === 'settings'  && <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>}
      {path === 'tracking'  && <><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></>}
    </svg>
  );
}

function Sidebar() {
  const menu = [
    { label: 'Dashboard', icon: 'dashboard', active: true },
    { label: 'Fleet', icon: 'fleet' },
    { label: 'Drivers', icon: 'drivers' },
    { label: 'Routes', icon: 'routes' },
    { label: 'Schedules', icon: 'schedules' },
    { label: 'Analytics', icon: 'analytics' },
    { label: 'Reports', icon: 'reports' },
    { label: 'Settings', icon: 'settings' },
  ];

  return (
    <div style={{
      width: "200px", flexShrink: 0,
      borderRight: "1px solid var(--glass-border)",
      padding: "20px 12px",
      display: "flex", flexDirection: "column", gap: "2px",
    }}>
      {/* Logo area */}
      <div style={{ padding: "4px 10px 20px", fontSize: "13px", fontWeight: 700, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
        TransitOps
      </div>

      {/* Nav items */}
      {menu.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "8px 10px",
          borderRadius: "7px",
          color: item.active ? "var(--text-main)" : "var(--text-muted)",
          background: item.active ? "var(--glass-bg)" : "transparent",
          border: item.active ? "1px solid var(--glass-border)" : "1px solid transparent",
          fontSize: "13px", fontWeight: item.active ? 600 : 400,
          cursor: "pointer",
        }}>
          <IconTemplate path={item.icon} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

const trips = [
  { route: "MG Road → Banjara Hills",     bus: "BUS-01A", driver: "R. Kumar",   status: "In Transit", onTime: true },
  { route: "Jubilee Hills → Hitec City",  bus: "BUS-42B", driver: "P. Reddy",   status: "In Transit", onTime: true },
  { route: "Secunderabad → Airport",      bus: "BUS-19X", driver: "A. Singh",   status: "Delayed",    onTime: false },
  { route: "Kukatpally → Mehdipatnam",    bus: "BUS-07C", driver: "S. Rao",     status: "In Transit", onTime: true },
];

const kpis = [
  { label: "Total Buses",         val: "128", delta: "+12%", icon: "fleet"     },
  { label: "Active Routes",       val: "24",  delta: "+8%",  icon: "routes"    },
  { label: "Today's Trips",       val: "346", delta: "+15%", icon: "tracking"  },
  { label: "On-Time Performance", val: "92%", delta: "+5%",  icon: "analytics" },
];

export function DashboardPreview() {
  return (
    <section style={{ paddingTop: "0", paddingBottom: "120px" }}>
      <div className="container">

        {/* Section header */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--text-muted)",
            border: "1px solid var(--glass-border)", borderRadius: "100px",
            padding: "4px 12px", display: "inline-block", marginBottom: "20px",
          }}>
            Live Dashboard
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Your operations, at a glance.
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "460px", margin: 0, lineHeight: 1.6 }}>
            A real-time command center for fleet managers — always current, always clear.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="animate-fade-up" style={{
          display: "flex",
          height: "560px",
          border: "1px solid var(--glass-border)",
          borderRadius: "16px",
          overflow: "hidden",
          background: "var(--bg-primary)",
        }}>
          <Sidebar />

          {/* Main content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

            {/* Top bar */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 24px",
              borderBottom: "1px solid var(--glass-border)",
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>Dashboard</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Saturday, 12 July 2025</div>
              </div>
              <div style={{
                fontSize: "12px", color: "var(--text-muted)",
                display: "flex", alignItems: "center", gap: "6px",
                border: "1px solid var(--glass-border)", padding: "6px 10px",
                borderRadius: "6px",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                May 12 – May 18
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", overflow: "hidden" }}>

              {/* KPI row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                {kpis.map((k, i) => (
                  <div key={i} style={{
                    padding: "16px",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "10px",
                    background: "var(--glass-bg)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>{k.label}</span>
                      <span style={{ color: "var(--text-muted)", opacity: 0.5 }}><IconTemplate path={k.icon} /></span>
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" }}>{k.val}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      <span style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>{k.delta}</span> vs last month
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom row */}
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "12px", flex: 1, minHeight: 0 }}>

                {/* Active trips table */}
                <div style={{
                  border: "1px solid var(--glass-border)",
                  borderRadius: "10px",
                  background: "var(--glass-bg)",
                  padding: "16px 20px",
                  display: "flex", flexDirection: "column",
                  overflow: "hidden",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Active Trips</span>
                    <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em", color: "var(--text-muted)", border: "1px solid var(--glass-border)", padding: "2px 8px", borderRadius: "4px" }}>LIVE</span>
                  </div>
                  <table style={{ width: "100%", fontSize: "12px", textAlign: "left", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ color: "var(--text-muted)" }}>
                        <th style={{ paddingBottom: "10px", fontWeight: 500, borderBottom: "1px solid var(--glass-border)" }}>Route</th>
                        <th style={{ paddingBottom: "10px", fontWeight: 500, borderBottom: "1px solid var(--glass-border)" }}>Bus</th>
                        <th style={{ paddingBottom: "10px", fontWeight: 500, borderBottom: "1px solid var(--glass-border)" }}>Driver</th>
                        <th style={{ paddingBottom: "10px", fontWeight: 500, borderBottom: "1px solid var(--glass-border)" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map((t, i) => (
                        <tr key={i} style={{ borderBottom: i < trips.length - 1 ? "1px solid var(--glass-border)" : "none" }}>
                          <td style={{ padding: "10px 0", color: "var(--text-main)", maxWidth: "160px" }}>{t.route}</td>
                          <td style={{ padding: "10px 0", color: "var(--text-muted)", fontFamily: "monospace", fontSize: "11px" }}>{t.bus}</td>
                          <td style={{ padding: "10px 0", color: "var(--text-muted)" }}>{t.driver}</td>
                          <td style={{ padding: "10px 0" }}>
                            <span style={{
                              fontSize: "11px", fontWeight: 600,
                              color: t.onTime ? "var(--accent-cyan)" : "var(--text-muted)",
                            }}>{t.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right column: chart + top routes */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                  {/* Performance chart */}
                  <div style={{
                    flex: 1,
                    border: "1px solid var(--glass-border)",
                    borderRadius: "10px",
                    background: "var(--glass-bg)",
                    padding: "16px 20px",
                    display: "flex", flexDirection: "column",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>
                      <span>Performance</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 400 }}>This Week</span>
                    </div>
                    <svg viewBox="0 0 260 90" style={{ width: "100%", flex: 1 }} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartfill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12"/>
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M0 75 C40 65,60 55,90 45 S140 30,180 38 S220 25,260 20"
                        fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
                      <path d="M0 75 C40 65,60 55,90 45 S140 30,180 38 S220 25,260 20 L260 90 L0 90 Z"
                        fill="url(#chartfill)"/>
                      {/* Bar markers at bottom */}
                      {["M","T","W","T","F","S","S"].map((d,i) => (
                        <text key={i} x={i*42+4} y="88" fontSize="8" fill="currentColor" opacity="0.3" fontFamily="Inter,sans-serif">{d}</text>
                      ))}
                    </svg>
                  </div>

                  {/* Top routes */}
                  <div style={{
                    border: "1px solid var(--glass-border)",
                    borderRadius: "10px",
                    background: "var(--glass-bg)",
                    padding: "16px 20px",
                  }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>Top Routes</div>
                    {[
                      { name: "MG Road → Banjara Hills",   pct: 92 },
                      { name: "Jubilee Hills → Hitec City", pct: 87 },
                    ].map((r, i) => (
                      <div key={i} style={{ marginBottom: i === 0 ? "10px" : 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{r.name}</span>
                          <span style={{ fontWeight: 600, fontSize: "11px" }}>{r.pct}%</span>
                        </div>
                        <div style={{ height: "3px", background: "var(--glass-border)", borderRadius: "2px" }}>
                          <div style={{ width: `${r.pct}%`, height: "100%", background: "var(--text-main)", borderRadius: "2px", opacity: 0.5 }} />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
