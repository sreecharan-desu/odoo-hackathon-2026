import { Link } from "react-router-dom";
import { ROUTES } from "../../types";

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
    [100, 350],[260, 330],[400, 360],
  ];

  return (
    <svg viewBox="0 0 480 430" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", maxHeight: "460px" }}>
      <defs>
        <style>{`
          @keyframes hbus1 { 0% { offset-distance:0% } 100% { offset-distance:100% } }
          @keyframes hbus2 { 0% { offset-distance:100% } 100% { offset-distance:0% } }
          @keyframes hnodepulse { 0%,100% { opacity:.3 } 50% { opacity:.85 } }
          .hb1 { offset-path:path("M 50 360 C 130 270,200 210,270 165 S 390 100,440 80"); offset-rotate:auto; animation:hbus1 7s linear infinite; }
          .hb2 { offset-path:path("M 440 360 C 340 280,240 220,160 175 S 80 120,50 90"); offset-rotate:auto; animation:hbus2 9s linear infinite; }
          .hnd  { animation:hnodepulse 2.2s ease-in-out infinite; }
        `}</style>
        <pattern id="sg" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.8"/>
        </pattern>
      </defs>

      <rect width="480" height="430" fill="url(#sg)"/>

      {/* Routes */}
      <path d="M 50 360 C 130 270,200 210,270 165 S 390 100,440 80"
        stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="7 5" fill="none"/>
      <path d="M 440 360 C 340 280,240 220,160 175 S 80 120,50 90"
        stroke="currentColor" strokeOpacity="0.13" strokeWidth="1.5" strokeDasharray="7 5" fill="none"/>
      <line x1="40" y1="215" x2="440" y2="215"
        stroke="currentColor" strokeOpacity="0.07" strokeWidth="1.5" strokeDasharray="9 7"/>

      {/* Stop nodes */}
      {stops.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="8" fill="currentColor" opacity="0.06"/>
          <circle cx={cx} cy={cy} r="3.5" fill="currentColor"
            className="hnd" style={{ animationDelay: `${i * 0.25}s` }}/>
        </g>
      ))}

      {/* Bus 1 */}
      <g className="hb1">
        <rect x="-13" y="-6" width="26" height="12" rx="3" fill="currentColor" opacity="0.88"/>
        <rect x="-9" y="-3.5" width="7" height="4.5" rx="1" fill="var(--bg-primary,#fff)" opacity="0.6"/>
        <rect x="1"  y="-3.5" width="7" height="4.5" rx="1" fill="var(--bg-primary,#fff)" opacity="0.6"/>
        <circle cx="-7" cy="6.5" r="2.2" fill="currentColor" opacity="0.9"/>
        <circle cx="7"  cy="6.5" r="2.2" fill="currentColor" opacity="0.9"/>
      </g>

      {/* Bus 2 */}
      <g className="hb2">
        <rect x="-10" y="-5" width="20" height="10" rx="3" fill="currentColor" opacity="0.55"/>
        <rect x="-6.5" y="-2.5" width="5" height="3.5" rx="1" fill="var(--bg-primary,#fff)" opacity="0.5"/>
        <rect x="1.5"  y="-2.5" width="5" height="3.5" rx="1" fill="var(--bg-primary,#fff)" opacity="0.5"/>
        <circle cx="-5" cy="5.5" r="2" fill="currentColor" opacity="0.75"/>
        <circle cx="5"  cy="5.5" r="2" fill="currentColor" opacity="0.75"/>
      </g>

    </svg>
  );
}

export function Hero() {
  return (
    <section style={{
      position: "relative",
      paddingTop: "88px",
      paddingBottom: "60px",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
    }}>
      <div className="container" style={{ position: "relative", zIndex: 1, width: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "40px" }}>

          {/* Left: Text content */}
          <div className="animate-fade-up" style={{ flex: "1 1 420px", maxWidth: "560px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "5px 12px", background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)", borderRadius: "100px",
              fontSize: "12px", fontWeight: 500, color: "var(--text-muted)",
              marginBottom: "16px",
            }}>
              <span className="text-accent"><BusIcon /></span>
              Smarter Transit. Better Cities.
            </div>

            <h1 style={{
              fontSize: "clamp(2.4rem, 4.5vw, 4rem)", fontWeight: 800,
              lineHeight: 1.1, margin: "0 0 16px 0", letterSpacing: "-0.03em",
            }}>
              Run Transit.<br/>
              Optimize Operations.<br/>
              <span style={{ color: "var(--accent-cyan)" }}>Move Cities Forward.</span>
            </h1>

            <p style={{
              fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.6,
              maxWidth: "440px", margin: "0 0 28px 0",
            }}>
              The all-in-one platform for fleet, drivers, routes, and analytics — built for modern transit operators.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
              <Link to={ROUTES.login} className="btn btn-primary" style={{ padding: "11px 24px", fontSize: "14px" }}>
                Request Demo &rarr;
              </Link>
              <a href="#features" className="btn btn-outline" style={{ padding: "11px 24px", fontSize: "14px" }}>
                Explore Features
              </a>
            </div>

            <div style={{
              display: "flex", flexWrap: "wrap", gap: "16px",
              borderTop: "1px solid var(--glass-border)", paddingTop: "20px",
            }}>
              {[
                { icon: <ShieldIcon />, label: "Driver Compliance" },
                { icon: <CalendarIcon />, label: "Smart Scheduling" },
                { icon: <BusIcon />, label: "Fleet Management" },
                { icon: <ChartIcon />, label: "Live Analytics" },
              ].map((feat, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  color: "var(--text-muted)", fontSize: "13px", fontWeight: 500,
                }}>
                  <span className="text-accent">{feat.icon}</span>
                  {feat.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: SVG illustration */}
          <div style={{
            flex: "1 1 360px", minHeight: "400px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TransitNetworkSVG />
          </div>

        </div>
      </div>
    </section>
  );
}
