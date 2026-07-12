import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "../../types";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "var(--nav-height)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        transition: "all 0.3s ease",
        background: scrolled ? "rgba(6, 17, 26, 0.75)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--accent-cyan)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
        <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.5px" }}>
          Transit<span style={{ color: "var(--accent-cyan)" }}>Ops</span>
        </span>
      </div>

      {/* Center Links */}
      <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "32px", fontSize: "14px", fontWeight: 500 }}>
        {["Features", "Solutions", "Use Cases", "Pricing", "About", "Contact"].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(' ', '-')}`}
            style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-main)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            {link}
          </a>
        ))}
      </div>

      {/* Right Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link to={ROUTES.login} className="btn btn-outline" style={{ padding: "10px 24px", fontSize: "14px" }}>
          Login
        </Link>
        <a href="#demo" className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "14px" }}>
          Request Demo &rarr;
        </a>
      </div>
    </nav>
  );
}
