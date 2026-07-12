import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { roleWorkspace } from "../../lib/rbac";
import Sidebar from "./Sidebar";
import "./shell.css";



function getInitials(name?: string): string {
  if (!name) return "U";
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Sun icon ── */
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

/* ── Moon icon ── */
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ── Logout icon ── */
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

export default function AppShell() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const workspace = roleWorkspace(user);
  const displayUser = user || { name: "Operator", role: "fleet_manager" };

  return (
    <div className="shell" data-role={displayUser.role}>
      <Sidebar />
      <div className="shell-body">
        <header className="shell-header">
          {/* Left — brand sub only, no search */}
          <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {workspace.brandSub}
          </p>

          {/* Right — user name, avatar, theme toggle, logout */}
          <div className="shell-header-user">
            <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.9rem" }}>
              {displayUser.name}
            </span>
            <div className="shell-header-avatar">{getInitials(displayUser.name)}</div>

            {/* Theme toggle */}
            <button
              type="button"
              className="theme-toggle"
              onClick={toggle}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Logout icon button */}
            <button
              type="button"
              className="theme-toggle"
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
