import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "../../types";
import { useTheme } from "../../hooks/useTheme";

// The custom TransitOps "T" icon from the brand image
function TransitOpsIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left wing */}
      <path d="M5 22 L38 22 L48 38 L30 38 Z" fill="var(--accent-cyan)" />
      {/* Right wing */}
      <path d="M95 22 L62 22 L52 38 L70 38 Z" fill="var(--accent-cyan)" />
      {/* Left stem */}
      <path d="M38 40 L46 40 L46 78 L38 68 Z" fill="var(--accent-cyan)" />
      {/* Right stem */}
      <path d="M62 40 L54 40 L54 78 L62 68 Z" fill="var(--accent-cyan)" />
    </svg>
  );
}

// Moon icon
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

// Sun icon
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggle } = useTheme();

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
        height: "var(--nav-height, 72px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        transition: "all 0.3s ease",
        background: scrolled
          ? isDark
            ? "rgba(6, 17, 26, 0.85)"
            : "rgba(255, 255, 255, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--glass-border, rgba(255,255,255,0.08))" : "1px solid transparent",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <TransitOpsIcon size={36} />
        <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-main, var(--color-text))" }}>
          Transit<span style={{ color: "var(--accent-cyan, #00d4a1)" }}>Ops</span>
        </span>
      </div>



      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Theme Toggle */}
        <button
          onClick={toggle}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            border: "1px solid var(--glass-border, rgba(255,255,255,0.12))",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(0,212,161,0.1)";
            e.currentTarget.style.color = "var(--accent-cyan, #00d4a1)";
            e.currentTarget.style.borderColor = "var(--accent-cyan, #00d4a1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.borderColor = "var(--glass-border, rgba(255,255,255,0.12))";
          }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        <Link to={ROUTES.login} className="btn btn-outline" style={{ padding: "9px 20px", fontSize: "14px" }}>
          Login
        </Link>
      </div>
    </nav>
  );
}
