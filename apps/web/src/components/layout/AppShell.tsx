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

export default function AppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const title = pageTitle(pathname);

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-body">
        <header className="shell-header">
          <h1 className="shell-header-title">{title}</h1>
          <div className="shell-header-user">
            <span style={{ fontWeight: 600 }}>{user?.name}</span>
            <span style={{
              fontSize: "0.75rem",
              background: "rgba(255, 255, 255, 0.1)",
              padding: "2px 8px",
              borderRadius: "12px",
              color: "var(--color-muted)"
            }}>
              {user?.role?.replace("_", " ")}
            </span>
            <Button type="button" variant="ghost" onClick={() => void logout()}>
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
