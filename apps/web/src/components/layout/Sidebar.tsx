import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getNavItemsForRole, roleBrandSubtitle } from "../../lib/rbac";

export default function Sidebar() {
  const { user } = useAuth();
  const navItems = getNavItemsForRole(user);

  return (
    <aside className="shell-sidebar">
      <div className="shell-brand">
        <h1 className="shell-brand-title">TransitOps</h1>
        <p className="shell-brand-sub">{roleBrandSubtitle(user?.role)}</p>
      </div>
      <nav className="shell-nav" aria-label="Main navigation">
        {navItems.map((item) => (
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
