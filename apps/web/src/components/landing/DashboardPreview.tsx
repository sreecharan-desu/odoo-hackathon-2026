function IconTemplate({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path === 'dashboard' && <><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></>}
      {path === 'tracking' && <><circle cx="12" cy="10" r="3"></circle><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"></path></>}
      {path === 'routes' && <><circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle></>}
      {path === 'fleet' && <><path d="M4 14.5A2.5 2.5 0 0 0 6.5 17h11a2.5 2.5 0 0 0 2.5-2.5V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6.5Z"></path><path d="M4 11h16"></path></>}
      {path === 'drivers' && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></>}
      {path === 'schedules' && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></>}
      {path === 'analytics' && <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></>}
      {path === 'reports' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></>}
      {path === 'settings' && <><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></>}
    </svg>
  );
}

function Sidebar() {
  const menu = [
    { label: 'Dashboard', icon: 'dashboard', active: true },
    { label: 'Live Tracking', icon: 'tracking' },
    { label: 'Routes', icon: 'routes' },
    { label: 'Fleet', icon: 'fleet' },
    { label: 'Drivers', icon: 'drivers' },
    { label: 'Schedules', icon: 'schedules' },
    { label: 'Analytics', icon: 'analytics' },
    { label: 'Reports', icon: 'reports' },
    { label: 'Settings', icon: 'settings' },
  ];

  return (
    <div style={{ width: "220px", borderRight: "1px solid var(--glass-border)", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--accent-cyan)", padding: "0 12px 24px 12px" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
      </div>
      {menu.map((item, i) => (
        <div key={i} style={{ 
          display: "flex", alignItems: "center", gap: "12px", 
          padding: "10px 12px", 
          borderRadius: "8px",
          color: item.active ? "var(--accent-cyan)" : "var(--text-muted)",
          background: item.active ? "rgba(22, 230, 216, 0.1)" : "transparent",
          fontSize: "13px", fontWeight: item.active ? 600 : 500,
          cursor: "pointer"
        }}>
          <IconTemplate path={item.icon} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function DashboardPreview() {
  return (
    <section className="container" style={{ paddingTop: "60px", paddingBottom: "100px" }}>
      <div className="glass-panel animate-fade-up" style={{ display: "flex", height: "800px", overflow: "hidden" }}>
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div style={{ flex: 1, padding: "32px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>Dashboard</h2>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--glass-border)" }}>
              May 12 - May 18, 2025 
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {[
              { label: "Total Buses", val: "128", trend: "+12%", icon: "fleet" },
              { label: "Active Routes", val: "24", trend: "+8%", icon: "routes" },
              { label: "Today's Trips", val: "346", trend: "+15%", icon: "tracking" },
              { label: "On-Time Performance", val: "92%", trend: "+5%", icon: "dashboard" }
            ].map((kpi, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{kpi.label}</div>
                  <div style={{ color: "var(--text-muted)" }}><IconTemplate path={kpi.icon} /></div>
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>{kpi.val}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}><span style={{ color: "var(--accent-cyan)" }}>{kpi.trend}</span> from last month</div>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "16px", flex: 1, minHeight: 0 }}>
            
            {/* Live Map Preview */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--glass-border)", padding: "20px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Live Map</div>
              <div style={{ flex: 1, position: "relative", borderRadius: "8px", overflow: "hidden", background: "#06111a", border: "1px solid var(--glass-border)" }}>
                {/* SVG Network Map Graphic */}
                <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="none" style={{ opacity: 0.8 }}>
                  <path d="M50 100 L 150 250 L 250 200 L 350 280 L 480 150" stroke="#3b82f6" strokeWidth="3" fill="none" />
                  <path d="M20 200 L 100 150 L 250 200 L 300 80 L 450 50" stroke="var(--accent-cyan)" strokeWidth="3" fill="none" />
                  <path d="M100 50 L 200 120 L 300 80" stroke="#a855f7" strokeWidth="3" fill="none" />
                  
                  {/* Nodes */}
                  <circle cx="150" cy="250" r="8" fill="#3b82f6" />
                  <circle cx="250" cy="200" r="8" fill="var(--accent-cyan)" />
                  <circle cx="350" cy="280" r="8" fill="#eab308" />
                  <circle cx="300" cy="80" r="8" fill="#a855f7" />
                  <circle cx="100" cy="150" r="8" fill="var(--accent-cyan)" />
                  
                  {/* Bus Markers */}
                  <g transform="translate(250, 200)">
                    <circle cx="0" cy="0" r="12" fill="white" />
                    <circle cx="0" cy="0" r="4" fill="var(--bg-primary)" />
                  </g>
                  <g transform="translate(100, 150)">
                    <circle cx="0" cy="0" r="12" fill="var(--accent-cyan)" />
                    <circle cx="0" cy="0" r="4" fill="var(--bg-primary)" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--glass-border)", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
                  <span>Performance Overview</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>This Week <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
                </div>
                <svg viewBox="0 0 300 120" style={{ width: "100%", height: "120px", marginTop: "16px" }}>
                  <path d="M 0 100 Q 30 80, 60 90 T 120 60 T 180 80 T 240 40 T 300 50" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />
                  <path d="M 0 100 Q 30 80, 60 90 T 120 60 T 180 80 T 240 40 T 300 50 L 300 120 L 0 120 Z" fill="var(--accent-cyan)" opacity="0.1" />
                </svg>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>
                  <span>Top Routes</span>
                  <span className="text-accent" style={{ fontSize: "12px", cursor: "pointer" }}>View All</span>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
                    <span style={{ color: "var(--text-muted)" }}>1. MG Road &rarr; Banjara Hills</span>
                    <span>92%</span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>
                    <div style={{ width: "92%", height: "100%", background: "var(--accent-cyan)", borderRadius: "2px" }} />
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
