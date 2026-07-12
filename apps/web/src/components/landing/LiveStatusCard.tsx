export function LiveStatusCard() {
  return (
    <div
      className="glass-panel animate-float"
      style={{
        position: "absolute",
        top: "25%",
        left: "-10%",
        width: "280px",
        padding: "20px",
        zIndex: 10,
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
          Live Bus Status
        </span>
        <span
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: "var(--accent-cyan)",
            borderRadius: "50%",
            boxShadow: "0 0 10px var(--accent-cyan)",
          }}
        ></span>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
          Bus 07B
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          MG Road &rarr; Banjara Hills
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>
          On Time
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-cyan)", fontSize: "13px", fontWeight: 500 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          25 km/h
        </div>
      </div>

      <button
        style={{
          width: "100%",
          padding: "10px",
          background: "rgba(22, 230, 216, 0.1)",
          border: "1px solid rgba(22, 230, 216, 0.2)",
          borderRadius: "8px",
          color: "var(--accent-cyan)",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.2s"
        }}
        onMouseOver={e => e.currentTarget.style.background = "rgba(22, 230, 216, 0.15)"}
        onMouseOut={e => e.currentTarget.style.background = "rgba(22, 230, 216, 0.1)"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
        </svg>
        View on Map
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Decorative connecting line */}
      <svg
        style={{ position: "absolute", bottom: "-60px", right: "40px", zIndex: -1 }}
        width="60"
        height="70"
        viewBox="0 0 60 70"
        fill="none"
      >
        <path d="M10 0 C 10 30, 50 40, 50 70" stroke="var(--accent-cyan)" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="50" cy="70" r="4" fill="var(--accent-cyan)" />
      </svg>
    </div>
  );
}
