import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../types";

export default function Sidebar() {
  return (
    <aside className="shell-sidebar">
      <div className="shell-brand">
        <h1 className="shell-brand-title">TransitOps</h1>
        <p className="shell-brand-sub">Fleet Management</p>
      </div>
      <nav className="shell-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `shell-nav-link${isActive ? " shell-nav-link--active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
