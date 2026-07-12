import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getNavItemsForRole } from "../../lib/rbac";

/* ── Nav icons mapped to route paths ── */
function NavIcon({ path }: { path: string }) {
  const s = { width: 17, height: 17, flexShrink: 0 as const };
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (path === "/")       return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="7" height="7" {...p}/><rect x="14" y="3" width="7" height="7" {...p}/><rect x="3" y="14" width="7" height="7" {...p}/><rect x="14" y="14" width="7" height="7" {...p}/></svg>;
  if (path === "/fleet")  return <svg viewBox="0 0 24 24" {...s}><rect x="1" y="3" width="15" height="13" {...p}/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" {...p}/><circle cx="5.5" cy="18.5" r="2.5" {...p}/><circle cx="18.5" cy="18.5" r="2.5" {...p}/></svg>;
  if (path === "/drivers") return <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...p}/><circle cx="9" cy="7" r="4" {...p}/><path d="M23 21v-2a4 4 0 0 0-3-3.87" {...p}/><path d="M16 3.13a4 4 0 0 1 0 7.75" {...p}/></svg>;
  if (path === "/trips")  return <svg viewBox="0 0 24 24" {...s}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" {...p}/></svg>;
  if (path === "/maintenance") return <svg viewBox="0 0 24 24" {...s}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" {...p}/></svg>;
  if (path === "/fuel-expenses") return <svg viewBox="0 0 24 24" {...s}><line x1="12" y1="1" x2="12" y2="23" {...p}/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" {...p}/></svg>;
  if (path === "/analytics") return <svg viewBox="0 0 24 24" {...s}><line x1="18" y1="20" x2="18" y2="10" {...p}/><line x1="12" y1="20" x2="12" y2="4" {...p}/><line x1="6" y1="20" x2="6" y2="14" {...p}/></svg>;
  // fallback
  return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3" {...p}/></svg>;
}

/* ── Chevron icons ── */
function ChevronLeft() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}

function LogoutIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}

function TransitOpsIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
  mobileOpen?: boolean;
}

export default function Sidebar({ collapsed, onToggle, onClose, mobileOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const navItems = getNavItemsForRole(user);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 199 }}
          onClick={onClose}
        />
      )}

      <aside
        className={`shell-sidebar${collapsed ? " shell-sidebar--collapsed" : ""}${mobileOpen ? " shell-sidebar--mobile-open" : ""}`}
        style={{ zIndex: 200 }}
      >
        {/* Brand */}
        <div className="shell-brand">
          {!collapsed ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                <TransitOpsIcon size={24} />
                <h1 className="shell-brand-title">TransitOps</h1>
              </div>
              <button className="sidebar-collapse-btn" onClick={onToggle} title="Collapse">
                <ChevronLeft />
              </button>
            </>
          ) : (
            <button className="sidebar-collapse-btn" onClick={onToggle} title="Expand" style={{ margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <TransitOpsIcon size={24} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="shell-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `shell-nav-link${isActive ? " shell-nav-link--active" : ""}`
              }
              title={collapsed ? item.label : undefined}
            >
              <NavIcon path={item.path} />
              {!collapsed && <span className="shell-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Mobile-only logout at bottom */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout-btn"
            onClick={() => void logout()}
            title="Sign out"
          >
            <LogoutIcon />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
