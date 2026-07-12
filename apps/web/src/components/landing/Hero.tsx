import { Link } from "react-router-dom";
import { ROUTES } from "../../types";
import { LiveStatusCard } from "./LiveStatusCard";

function BusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.5A2.5 2.5 0 0 0 6.5 17h11a2.5 2.5 0 0 0 2.5-2.5V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6.5Z"/>
      <path d="M4 11h16"/><path d="M12 4v7"/><path d="M8 17v2"/><path d="M16 17v2"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

export function Hero() {
  return (
    <section style={{ position: "relative", paddingTop: "140px", paddingBottom: "100px", minHeight: "90vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      
      {/* Background Graphic */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        {/* We use a gradient here as a fallback, but the design calls for a large city background image. We'll simulate it with a very dark gradient. */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "60%", height: "100%", background: "radial-gradient(ellipse at center, rgba(22, 230, 216, 0.15), transparent 70%)" }} />
        {/* Mocking the luxury electric bus image */}
        <img 
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" 
          alt="Luxury Electric Bus in City"
          style={{ position: "absolute", top: "10%", right: "-10%", width: "55%", height: "80%", objectFit: "cover", borderRadius: "24px", opacity: 0.6, maskImage: "linear-gradient(to left, black 50%, transparent 100%)", WebkitMaskImage: "linear-gradient(to left, black 50%, transparent 100%)" }}
        />
      </div>

      <div className="container" style={{ position: "relative", zIndex: 1, width: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
          
          {/* Left Content (45%) */}
          <div className="animate-fade-up" style={{ flex: "1 1 500px", maxWidth: "600px", paddingRight: "40px" }}>
            
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "100px", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "32px", backdropFilter: "blur(10px)" }}>
              <span className="text-accent"><BusIcon /></span>
              Smarter Transit. Better Cities.
            </div>
            
            <h1 style={{ fontSize: "clamp(3.5rem, 6vw, 5.5rem)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 24px 0", letterSpacing: "-0.03em" }}>
              Run Transit.<br/>
              Optimize Operations.<br/>
              <span className="text-gradient">Move Cities Forward.</span>
            </h1>
            
            <p style={{ fontSize: "1.125rem", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: "520px", margin: "0 0 40px 0" }}>
              TransitOps is an all-in-one platform to manage your fleet, routes, drivers, passengers, analytics, and operations using real-time intelligence.
            </p>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "60px" }}>
              <Link to={ROUTES.login} className="btn btn-primary" style={{ padding: "16px 32px", fontSize: "16px" }}>
                Request Demo &rarr;
              </Link>
              <a href="#features" className="btn btn-outline" style={{ padding: "16px 32px", fontSize: "16px" }}>
                Explore Features
              </a>
            </div>

            {/* Feature Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", borderTop: "1px solid var(--glass-border)", paddingTop: "32px" }}>
              {[
                { icon: <MapPinIcon />, label: "Real-time Tracking" },
                { icon: <CalendarIcon />, label: "Smart Scheduling" },
                { icon: <BusIcon />, label: "Fleet Management" },
                { icon: <ChartIcon />, label: "Live Analytics" }
              ].map((feat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "14px", fontWeight: 500 }}>
                  <span className="text-accent">{feat.icon}</span>
                  {feat.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div style={{ flex: "1 1 400px", position: "relative", minHeight: "400px" }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
               {/* Live Status Card floating over the background image */}
               <LiveStatusCard />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
