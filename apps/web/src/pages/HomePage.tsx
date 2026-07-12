import { Link } from "react-router-dom";
import "../styles/globals.css";

import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { DashboardPreview } from "../components/landing/DashboardPreview";
import { FeatureSection } from "../components/landing/FeatureSection";
import { ROUTES } from "../types";

export default function HomePage() {
  return (
    <div
      className="landing-page"
      style={{
        background: "var(--bg-primary)",
        minHeight: "100vh",
        color: "var(--text-main)",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <Navbar />
      <Hero />
      <DashboardPreview />
      <FeatureSection />

      <section
        style={{
          borderTop: "1px solid var(--glass-border)",
          padding: "72px 0 88px",
          background: "var(--bg-secondary)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "28px",
          }}
        >
          <div style={{ maxWidth: "520px" }}>
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 750,
                letterSpacing: "-0.03em",
                color: "var(--text-main)",
              }}
            >
              Ready for the ops walkthrough.
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.6, fontSize: "0.98rem" }}>
              Sign in as Fleet Manager, dispatch MH04AB1234 with Alex at 450 kg,
              then prove the fail beats and export the PDF report.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <Link to={ROUTES.login} className="btn btn-primary" style={{ padding: "12px 26px", fontSize: "14px" }}>
              Launch demo &rarr;
            </Link>
            <a href="#features" className="btn btn-outline" style={{ padding: "12px 26px", fontSize: "14px" }}>
              Back to features
            </a>
          </div>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--glass-border)",
          padding: "22px 0 36px",
          color: "var(--text-muted)",
          fontSize: "12.5px",
          background: "var(--bg-primary)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span>TransitOps · PostgreSQL · FastAPI · React · Docker</span>
          <span>Odoo Hackathon 2026</span>
        </div>
      </footer>
    </div>
  );
}
