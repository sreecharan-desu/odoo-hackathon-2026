import { Link } from "react-router-dom";
import { ROUTES } from "../../types";
import { useTheme } from "../../hooks/useTheme";

function BusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.5A2.5 2.5 0 0 0 6.5 17h11a2.5 2.5 0 0 0 2.5-2.5V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6.5Z"/>
      <path d="M4 11h16"/><path d="M12 4v7"/><path d="M8 17v2"/><path d="M16 17v2"/>
      <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function TransitNetworkSVG() {
  const stops: [number, number][] = [
    [80, 110], [200, 155], [330, 120],
    [60, 240], [190, 215], [340, 250],
    [100, 350], [260, 330], [400, 360],
  ];

  return (
    <svg viewBox="0 0 480 430" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", maxHeight: "620px", minHeight: "420px" }}>
      <defs>
        <style>{`
          @keyframes hbus1 { 0% { offset-distance:0% } 100% { offset-distance:100% } }
          @keyframes hbus2 { 0% { offset-distance:100% } 100% { offset-distance:0% } }
          @keyframes hnodepulse { 0%,100% { opacity:.35 } 50% { opacity:1 } }
          @keyframes hring { 0% { r:6; opacity:.35 } 100% { r:18; opacity:0 } }
          .hb1 { offset-path:path("M 50 360 C 130 270,200 210,270 165 S 390 100,440 80"); offset-rotate:auto; animation:hbus1 7s linear infinite; }
          .hb2 { offset-path:path("M 440 360 C 340 280,240 220,160 175 S 80 120,50 90"); offset-rotate:auto; animation:hbus2 9s linear infinite; }
          .hnd  { animation:hnodepulse 2.2s ease-in-out infinite; }
          .hring { animation:hring 2.4s ease-out infinite; }
        `}</style>
        <radialGradient id="glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.07"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
        </radialGradient>
        <pattern id="sg" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.8"/>
        </pattern>
      </defs>

      <rect width="480" height="430" fill="url(#glow)"/>
      <rect width="480" height="430" fill="url(#sg)"/>

      <path d="M 50 360 C 130 270,200 210,270 165 S 390 100,440 80"
        stroke="currentColor" strokeOpacity="0.28" strokeWidth="2" strokeDasharray="7 5" fill="none"/>
      <path d="M 440 360 C 340 280,240 220,160 175 S 80 120,50 90"
        stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.5" strokeDasharray="7 5" fill="none"/>
      <line x1="40" y1="215" x2="440" y2="215"
        stroke="currentColor" strokeOpacity="0.08" strokeWidth="1.5" strokeDasharray="9 7"/>

      {stops.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" className="hring" style={{ animationDelay: `${i * 0.2}s` }} />
          <circle cx={cx} cy={cy} r="8" fill="currentColor" opacity="0.06"/>
          <circle cx={cx} cy={cy} r="3.5" fill="currentColor"
            className="hnd" style={{ animationDelay: `${i * 0.25}s` }}/>
        </g>
      ))}

      <g className="hb1">
        <rect x="-13" y="-6" width="26" height="12" rx="3" fill="currentColor" opacity="0.92"/>
        <rect x="-9" y="-3.5" width="7" height="4.5" rx="1" fill="var(--bg-primary,#fff)" opacity="0.55"/>
        <rect x="1"  y="-3.5" width="7" height="4.5" rx="1" fill="var(--bg-primary,#fff)" opacity="0.55"/>
        <circle cx="-7" cy="6.5" r="2.2" fill="currentColor" opacity="0.9"/>
        <circle cx="7"  cy="6.5" r="2.2" fill="currentColor" opacity="0.9"/>
      </g>

      <g className="hb2">
        <rect x="-10" y="-5" width="20" height="10" rx="3" fill="currentColor" opacity="0.6"/>
        <rect x="-6.5" y="-2.5" width="5" height="3.5" rx="1" fill="var(--bg-primary,#fff)" opacity="0.45"/>
        <rect x="1.5"  y="-2.5" width="5" height="3.5" rx="1" fill="var(--bg-primary,#fff)" opacity="0.45"/>
        <circle cx="-5" cy="5.5" r="2" fill="currentColor" opacity="0.75"/>
        <circle cx="5"  cy="5.5" r="2" fill="currentColor" opacity="0.75"/>
      </g>
    </svg>
  );
}

export function Hero() {
  const { isDark } = useTheme();

  return (
    <section style={{
      paddingTop: "calc(var(--nav-height) + 24px)",
      paddingBottom: "48px",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: isDark
          ? "radial-gradient(ellipse 75% 60% at 72% 42%, rgba(255,255,255,0.06), transparent 62%)"
          : "radial-gradient(ellipse 75% 60% at 72% 42%, rgba(0,0,0,0.045), transparent 62%)",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "1400px" }}>
        <div className="responsive-grid-2" style={{ alignItems: "center", gap: "clamp(28px, 4vw, 56px)" }}>
          <div className="animate-fade-up" style={{ maxWidth: "720px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "8px 16px", background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)", borderRadius: "100px",
              fontSize: "14px", fontWeight: 500, color: "var(--text-muted)",
              marginBottom: "22px",
            }}>
              <span className="text-accent"><BusIcon /></span>
              Smart Transport Operations
            </div>

            <h1 style={{
              fontSize: "clamp(3.4rem, 8vw, 7rem)", fontWeight: 800,
              lineHeight: 0.95, margin: "0 0 22px 0", letterSpacing: "-0.05em",
            }}>
              TransitOps
            </h1>

            <p style={{
              fontSize: "clamp(1.25rem, 2.4vw, 1.75rem)", fontWeight: 600,
              lineHeight: 1.3, margin: "0 0 18px 0", letterSpacing: "-0.025em",
              maxWidth: "640px",
            }}>
              Fleet. Drivers. Dispatch. Reports — with rules the API actually enforces.
            </p>

            <p style={{
              fontSize: "clamp(1rem, 1.4vw, 1.15rem)", color: "var(--text-muted)", lineHeight: 1.65,
              maxWidth: "560px", margin: "0 0 32px 0",
            }}>
              Stop running logistics on spreadsheets. One platform for vehicle status,
              license compliance, trip lifecycle, maintenance, and cost analytics in ₹.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "40px" }}>
              <Link to={ROUTES.login} className="btn btn-primary" style={{ padding: "16px 34px", fontSize: "16px" }}>
                Open demo &rarr;
              </Link>
              <a href="#features" className="btn btn-outline" style={{ padding: "16px 34px", fontSize: "16px" }}>
                See capabilities
              </a>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "16px",
              borderTop: "1px solid var(--glass-border)",
              paddingTop: "26px",
              maxWidth: "560px",
            }}>
              {[
                { value: "4", label: "Operator desks" },
                { value: "8+", label: "API business rules" },
                { value: "₹", label: "Costs & ROI" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)", fontWeight: 750, letterSpacing: "-0.03em" }}>{stat.value}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{
              display: "flex", flexWrap: "wrap", gap: "18px",
              marginTop: "26px",
            }}>
              {[
                { icon: <ShieldIcon />, label: "License gates" },
                { icon: <CalendarIcon />, label: "Trip lifecycle" },
                { icon: <BusIcon />, label: "Fleet registry" },
                { icon: <ChartIcon />, label: "CSV + PDF" },
              ].map((feat) => (
                <div key={feat.label} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  color: "var(--text-muted)", fontSize: "14px", fontWeight: 500,
                }}>
                  <span className="text-accent">{feat.icon}</span>
                  {feat.label}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            flex: "1 1 420px", minHeight: "520px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: "scale(1.08)",
            transformOrigin: "center",
          }}>
            <TransitNetworkSVG />
          </div>
        </div>
      </div>
    </section>
  );
}
