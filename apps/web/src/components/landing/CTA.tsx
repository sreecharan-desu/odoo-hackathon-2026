import { Link } from "react-router-dom";
import { ROUTES } from "../../types";

export function CTA() {
  return (
    <section className="container" style={{ paddingBottom: "120px" }}>
      <div 
        className="glass-panel" 
        style={{ 
          textAlign: "center", 
          padding: "80px 40px", 
          background: "radial-gradient(ellipse at center, rgba(22, 230, 216, 0.1), rgba(17, 24, 39, 0.65))" 
        }}
      >
        <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, margin: "0 0 24px 0", letterSpacing: "-0.03em" }}>
          Ready to modernize your<br/>
          <span className="text-gradient">transit operations?</span>
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1.25rem", maxWidth: "600px", margin: "0 auto 40px auto", lineHeight: 1.6 }}>
          Join hundreds of cities and operators already using TransitOps to increase on-time performance and reduce costs.
        </p>
        <div className="flex-center" style={{ flexWrap: "wrap", gap: "16px" }}>
          <Link to={ROUTES.login} className="btn btn-primary" style={{ padding: "16px 32px", fontSize: "16px" }}>
            Request Demo &rarr;
          </Link>
          <a href="#contact" className="btn btn-outline" style={{ padding: "16px 32px", fontSize: "16px" }}>
            Book a Call
          </a>
        </div>
      </div>
    </section>
  );
}
