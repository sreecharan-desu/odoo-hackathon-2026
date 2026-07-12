import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import Sidebar from "./Sidebar";
import "./shell.css";

function getInitials(name?: string): string {
  if (!name) return "U";
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

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

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const displayUser = user || { name: "Operator", role: "fleet_manager" };
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="shell" data-role={displayUser.role}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="shell-body">
        <header className="shell-header">
          {/* Left: hamburger (mobile only) + brand label */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Hamburger — mobile only */}
            <button
              type="button"
              className="theme-toggle hamburger-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <HamburgerIcon />
            </button>
          </div>

          {/* Right — user name, avatar, theme toggle, logout (hidden on mobile) */}
          <div className="shell-header-user">
            <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.88rem" }}>
              {displayUser.name}
            </span>
            <div className="shell-header-avatar">{getInitials(displayUser.name)}</div>

            <button
              type="button"
              className="theme-toggle"
              onClick={toggle}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Logout — hidden on mobile (moved to sidebar) */}
            <button
              type="button"
              className="theme-toggle desktop-logout"
              onClick={() => void logout()}
              title="Sign out"
              aria-label="Sign out"
              style={{ color: "var(--color-danger)" }}
            >
              <LogoutIcon />
            </button>
          </div>
        </header>

        <main className="shell-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
