import { Outlet, useLocation } from "react-router-dom";
import { Button } from "../ui";
import { useAuth } from "../../hooks/useAuth";
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
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function roleAccent(role?: string): { bg: string; color: string; border: string } {
  switch (role) {
    case "fleet_manager":
      return { bg: "rgba(240, 165, 0, 0.15)", color: "#f0a500", border: "rgba(240, 165, 0, 0.35)" };
    case "driver":
      return { bg: "rgba(0, 123, 255, 0.15)", color: "#3b82f6", border: "rgba(0, 123, 255, 0.3)" };
    case "safety_officer":
      return { bg: "rgba(40, 167, 69, 0.15)", color: "#28a745", border: "rgba(40, 167, 69, 0.3)" };
    case "financial_analyst":
      return { bg: "rgba(111, 66, 193, 0.15)", color: "#a78bfa", border: "rgba(111, 66, 193, 0.35)" };
    default:
      return { bg: "rgba(0, 123, 255, 0.15)", color: "#007bff", border: "rgba(0, 123, 255, 0.2)" };
  }
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const workspace = roleWorkspace(user);
  const title = pageTitle(pathname, navItemsForRole(user));
  const displayUser = user || { name: "Operator", role: "fleet_manager" };
  const accent = roleAccent(displayUser.role);

  return (
    <div className="shell" data-role={displayUser.role}>
      <Sidebar />
      <div className="shell-body">
        <header className="shell-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <h1 className="shell-header-title" style={{ display: "none" }}>
              {title}
            </h1>
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted)", letterSpacing: "0.04em" }}>
                {workspace.brandSub.toUpperCase()}
              </p>
              <input type="text" placeholder="Search..." className="shell-header-search" />
            </div>
          </div>
          <div className="shell-header-user">
            <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{displayUser.name}</span>
            <span
              style={{
                fontSize: "0.75rem",
                background: accent.bg,
                padding: "2px 8px",
                borderRadius: "12px",
                color: accent.color,
                fontWeight: 600,
                border: `1px solid ${accent.border}`,
              }}
            >
              {formatRoleName(displayUser.role)}
            </span>
            <div className="shell-header-avatar">{getInitials(displayUser.name)}</div>
            <Button type="button" variant="ghost" style={{ marginLeft: "var(--space-2)" }} onClick={() => void logout()}>
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
