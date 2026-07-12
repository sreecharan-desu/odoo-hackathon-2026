import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "../../types";
import { useTheme } from "../../hooks/useTheme";

function TransitOpsIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 22 L38 22 L48 38 L30 38 Z" fill="var(--accent-cyan)" />
      <path d="M95 22 L62 22 L52 38 L70 38 Z" fill="var(--accent-cyan)" />
      <path d="M38 40 L46 40 L46 78 L38 68 Z" fill="var(--accent-cyan)" />
      <path d="M62 40 L54 40 L54 78 L62 68 Z" fill="var(--accent-cyan)" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

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
    const handleScroll = () => setScrolled(window.scrollY > 12);
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
        transition: "background 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease",
        background: scrolled
          ? isDark
            ? "rgba(0, 0, 0, 0.88)"
            : "rgba(255, 255, 255, 0.92)"
          : isDark
            ? "rgba(0, 0, 0, 0.35)"
            : "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: scrolled
          ? "1px solid var(--glass-border)"
          : "1px solid transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <TransitOpsIcon size={36} />
        <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-main)" }}>
          Transit<span style={{ color: "var(--accent-cyan)" }}>Ops</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          onClick={toggle}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            border: "1px solid var(--glass-border)",
            background: "var(--glass-bg)",
            color: "var(--text-main)",
            cursor: "pointer",
            transition: "all 0.2s",
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
