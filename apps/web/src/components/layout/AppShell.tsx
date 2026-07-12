import { Outlet, useLocation } from "react-router-dom";
import { Button } from "../ui";
import { useAuth } from "../../hooks/useAuth";
import { NAV_ITEMS } from "../../types";
import Sidebar from "./Sidebar";
import "./shell.css";

function pageTitle(pathname: string): string {
  const match = NAV_ITEMS.find((item) =>
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

export default function AppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const title = pageTitle(pathname);

  const displayUser = user || { name: "Raven K.", role: "dispatcher" };

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-body">
        <header className="shell-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <h1 className="shell-header-title" style={{ display: "none" }}>{title}</h1>
            <input type="text" placeholder="Search..." className="shell-header-search" />
          </div>
          <div className="shell-header-user">
            <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{displayUser.name}</span>
            <span style={{
              fontSize: "0.75rem",
              background: "rgba(0, 123, 255, 0.15)",
              padding: "2px 8px",
              borderRadius: "12px",
              color: "#007bff",
              fontWeight: 600,
              border: "1px solid rgba(0, 123, 255, 0.2)"
            }}>
              {formatRoleName(displayUser.role)}
            </span>
            <div className="shell-header-avatar">
              {getInitials(displayUser.name)}
            </div>
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
