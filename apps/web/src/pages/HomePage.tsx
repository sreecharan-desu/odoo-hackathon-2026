import { Link } from "react-router-dom";
import { ROUTES } from "../types";
import { useTheme } from "../hooks/useTheme";
import "../components/layout/shell.css";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function HomePage() {
  const { isDark, toggle } = useTheme();

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh", overflowX: "hidden" }}>
      
      {/* Navbar (Strict B&W) */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 40px", background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.5px", textTransform: "uppercase" }}>TransitOps</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          <a href="#features" style={{ color: "var(--color-text)", textDecoration: "none", fontSize: "13px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px" }}>Features</a>
          <a href="#about" style={{ color: "var(--color-text)", textDecoration: "none", fontSize: "13px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px" }}>About</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button
            type="button"
            style={{ background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text)", cursor: "pointer", padding: 0 }}
            onClick={toggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link to={ROUTES.login} style={{ padding: "12px 24px", background: "var(--color-text)", color: "var(--color-bg)", textDecoration: "none", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = "0.8"} onMouseOut={e => e.currentTarget.style.opacity = "1"}>
            Login
          </Link>
        </div>
      </nav>

      <main style={{ position: "relative", zIndex: 10, maxWidth: "1400px", margin: "0 auto", padding: "180px 40px 120px 40px" }}>
        
        {/* Minimalist Hero Section */}
        <section style={{ textAlign: "center", marginBottom: "160px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h1 style={{ fontSize: "clamp(4rem, 8vw, 7rem)", fontWeight: 800, lineHeight: 1, margin: "0 0 40px 0", letterSpacing: "-0.05em", color: "var(--color-text)", textTransform: "uppercase", maxWidth: "1200px" }}>
            The Complete Lifecycle Of Transport Operations.
          </h1>
          <p style={{ fontSize: "1.5rem", color: "var(--color-muted)", lineHeight: 1.5, marginBottom: "60px", maxWidth: "700px", fontWeight: 400 }}>
            Digitize vehicles, drivers, dispatching, maintenance, and expenses in one strict, unified platform with enforced business rules.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link to={ROUTES.login} style={{ padding: "20px 48px", background: "var(--color-text)", color: "var(--color-bg)", textDecoration: "none", fontSize: "16px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-text)" }}>
              Access Platform
            </Link>
            <a href="#features" style={{ padding: "20px 48px", background: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)", textDecoration: "none", fontSize: "16px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              Explore Specs
            </a>
          </div>
        </section>

        {/* Minimalist Grid Section */}
        <div id="features" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "80px", marginBottom: "80px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0" }}>
            
            {/* Box 1: Fleet Managers & Drivers */}
            <div style={{ padding: "60px", borderRight: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "12px", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "24px" }}>01. Logistics</div>
              <h3 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 24px 0", color: "var(--color-text)", letterSpacing: "-1px" }}>Fleet & Dispatch</h3>
              <p style={{ color: "var(--color-muted)", fontSize: "16px", lineHeight: 1.6, margin: "0 0 40px 0" }}>
                Empower Fleet Managers to oversee assets and lifecycle, while Drivers seamlessly create trips, assign vehicles, and monitor active deliveries.
              </p>
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--color-border)", paddingTop: "24px" }}>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>→ Vehicle Registry & Management</span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>→ End-to-End Trip Lifecycle</span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>→ Comprehensive Driver Profiles</span>
              </div>
            </div>

            {/* Box 2: Safety Officers */}
            <div style={{ padding: "60px", borderBottom: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "12px", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "24px" }}>02. Auditing</div>
              <h3 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 24px 0", color: "var(--color-text)", letterSpacing: "-1px" }}>Safety & Compliance</h3>
              <p style={{ color: "var(--color-muted)", fontSize: "16px", lineHeight: 1.6, margin: "0 0 40px 0" }}>
                Ensure driver compliance, track license validity, enforce load capacities, and monitor safety scores across the entire fleet network.
              </p>
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--color-border)", paddingTop: "24px" }}>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>→ License Expiry Tracking</span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>→ Automated Capacity Validation</span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>→ Driver Safety Scoring</span>
              </div>
            </div>

            {/* Box 3: Financial Analysts */}
            <div style={{ padding: "60px", borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "12px", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "24px" }}>03. Economy</div>
              <h3 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 24px 0", color: "var(--color-text)", letterSpacing: "-1px" }}>Financial Analytics</h3>
              <p style={{ color: "var(--color-muted)", fontSize: "16px", lineHeight: 1.6, margin: "0 0 40px 0" }}>
                Review operational expenses, log fuel consumption, track maintenance costs, and calculate exact vehicle ROI automatically.
              </p>
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--color-border)", paddingTop: "24px" }}>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>→ Fuel Consumption Logging</span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>→ Total Cost Calculation</span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>→ Vehicle ROI Metrics</span>
              </div>
            </div>

            {/* Box 4: Architecture */}
            <div style={{ padding: "60px", display: "flex", flexDirection: "column", background: "var(--color-text)", color: "var(--color-bg)" }}>
              <div style={{ fontSize: "12px", color: "var(--color-bg)", opacity: 0.7, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "24px" }}>04. Core</div>
              <h3 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 24px 0", color: "var(--color-bg)", letterSpacing: "-1px" }}>Strict Business Rules</h3>
              <p style={{ color: "var(--color-bg)", opacity: 0.8, fontSize: "16px", lineHeight: 1.6, margin: "0 0 40px 0" }}>
                Built on a foundation of rigid validations. Retired vehicles never dispatch. Suspended drivers never drive. Statuses transition automatically.
              </p>
              <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "24px" }}>
                <Link to={ROUTES.login} style={{ color: "var(--color-bg)", textDecoration: "none", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>View Dashboard</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer style={{ padding: "40px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "1px" }}>TransitOps</div>
        <div style={{ fontSize: "12px", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>© 2026 SYSTEM ARCHITECTURE</div>
      </footer>

    </div>
  );
}
