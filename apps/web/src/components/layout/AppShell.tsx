import { Outlet, useLocation } from "react-router-dom";
import { Button } from "../ui";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { navItemsForRole, roleWorkspace } from "../../lib/rbac";
import Sidebar from "./Sidebar";
import "./shell.css";

function pageTitle(pathname: string, labels: { path: string; label: string }[]): string {
  const match = labels.find((item) =>
    item.path === "/" ? pathname === "/" : pathname.startsWith(item.path),
  );
  return match?.label ?? "TransitOps";
}

function formatRoleName(role?: string): string {
  if (!role) return "User";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

export default function AppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { isDark, toggle } = useTheme();
  const workspace = roleWorkspace(user);
  const title = pageTitle(pathname, navItemsForRole(user));
  const displayUser = user || { name: "Operator", role: "fleet_manager" };

  return (
    <div className="shell" data-role={displayUser.role}>
      <Sidebar />
      <div className="shell-body">
        <header className="shell-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <h1 className="shell-header-title" style={{ display: "none" }}>{title}</h1>
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted)", letterSpacing: "0.04em" }}>
                {workspace.brandSub.toUpperCase()}
              </p>
              <input type="text" placeholder="Search..." className="shell-header-search" />
            </div>
          </div>

          <div className="shell-header-user">
            <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{displayUser.name}</span>
            <span className="shell-role-badge">
              {formatRoleName(displayUser.role)}
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

            <Button
              type="button"
              variant="ghost"
              style={{ marginLeft: "var(--space-1)" }}
              onClick={() => void logout()}
            >
              Sign out
            </Button>
          </div>
        </header>

        <main className="shell-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
