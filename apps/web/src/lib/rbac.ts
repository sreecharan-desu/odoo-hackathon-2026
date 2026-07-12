import type { AuthUser } from "../types";
import { ROUTES, type AppRoute, type NavItem } from "../types";

export function hasRole(user: AuthUser | null | undefined, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/** Create/update vehicles — fleet manager owns the registry */
export function canManageFleet(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "fleet_manager");
}

/** Open/close maintenance — fleet manager only */
export function canManageMaintenance(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "fleet_manager");
}

export function canManageDrivers(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "fleet_manager", "safety_officer");
}

export function canManageTrips(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "fleet_manager", "driver");
}

export function canDispatchTrips(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "fleet_manager");
}

export function canManageExpenses(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "fleet_manager", "financial_analyst");
}

export function canLogFuel(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "fleet_manager", "financial_analyst", "driver");
}

export function canViewAnalytics(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "fleet_manager", "financial_analyst");
}

/** Routes each role may open (nav + deep-link guards), with role-specific sidebar labels. */
const ROLE_NAV: Record<string, NavItem[]> = {
  fleet_manager: [
    { path: ROUTES.dashboard, label: "Operations Overview" },
    { path: ROUTES.fleet, label: "Vehicle Registry" },
    { path: ROUTES.drivers, label: "Driver Roster" },
    { path: ROUTES.trips, label: "Trip Dispatch" },
    { path: ROUTES.maintenance, label: "Shop & Maintenance" },
    { path: ROUTES.fuelExpenses, label: "Fuel & Expenses" },
    { path: ROUTES.analytics, label: "Fleet Reports" },
  ],
  driver: [
    { path: ROUTES.trips, label: "My Trips & Deliveries" },
    { path: ROUTES.fuelExpenses, label: "Log Fuel" },
    { path: ROUTES.dashboard, label: "Delivery Status" },
  ],
  safety_officer: [
    { path: ROUTES.drivers, label: "License & Compliance" },
    { path: ROUTES.dashboard, label: "Safety Overview" },
  ],
  financial_analyst: [
    { path: ROUTES.fuelExpenses, label: "Fuel & Cost Tracking" },
    { path: ROUTES.analytics, label: "Profitability & ROI" },
    { path: ROUTES.fleet, label: "Asset Cost Review" },
    { path: ROUTES.dashboard, label: "Cost Overview" },
  ],
};

const ROLE_ROUTES: Record<string, AppRoute[]> = Object.fromEntries(
  Object.entries(ROLE_NAV).map(([role, items]) => [role, items.map((item) => item.path)]),
) as Record<string, AppRoute[]>;

const ROLE_HOME: Record<string, AppRoute> = {
  fleet_manager: ROUTES.dashboard,
  driver: ROUTES.trips,
  safety_officer: ROUTES.drivers,
  financial_analyst: ROUTES.fuelExpenses,
};

export type RoleWorkspace = {
  brandSub: string;
  dashboardTitle: string;
  dashboardSub: string;
};

export function roleWorkspace(user: AuthUser | null | undefined): RoleWorkspace {
  switch (user?.role) {
    case "driver":
      return {
        brandSub: "Trips & Deliveries",
        dashboardTitle: "Delivery Monitor",
        dashboardSub: "Track active trips and delivery status for your routes",
      };
    case "safety_officer":
      return {
        brandSub: "Driver Compliance",
        dashboardTitle: "Safety Overview",
        dashboardSub: "Compliance alerts, driver readiness, and fleet risk signals",
      };
    case "financial_analyst":
      return {
        brandSub: "Fuel & Cost Analytics",
        dashboardTitle: "Cost Overview",
        dashboardSub: "Fleet utilization and operating signals that drive spend",
      };
    case "fleet_manager":
    default:
      return {
        brandSub: "Fleet Operations",
        dashboardTitle: "Fleet Operations Dashboard",
        dashboardSub: "Real-time fleet performance and operations monitoring",
      };
  }
}

export function roleBrandSubtitle(role?: string): string {
  return roleWorkspace(role ? ({ role } as AuthUser) : null).brandSub;
}

type ChromePage = "fleet" | "drivers" | "trips" | "maintenance" | "fuel" | "analytics";

export function pageChrome(user: AuthUser | null | undefined, page: ChromePage): { title: string; sub: string } {
  const role = user?.role;

  if (page === "trips") {
    if (role === "driver") {
      return {
        title: "My Trips & Deliveries",
        sub: "Create trips and monitor deliveries on your routes",
      };
    }
    return {
      title: "Trip Operations",
      sub: "Schedule routes, dispatch assets, and monitor active trip logs",
    };
  }

  if (page === "drivers") {
    if (role === "safety_officer") {
      return {
        title: "Driver Compliance",
        sub: "Licenses, expiry dates, and safety performance scores",
      };
    }
    return {
      title: "Drivers & Safety",
      sub: "Manage driver registry, license expiration, and safety indices",
    };
  }

  if (page === "fleet") {
    if (role === "financial_analyst") {
      return {
        title: "Fleet Assets",
        sub: "Review vehicles for cost allocation and ROI context",
      };
    }
    return {
      title: "Vehicle Registry",
      sub: "Manage fleet assets, load parameters, and assignment statuses",
    };
  }

  if (page === "fuel") {
    if (role === "driver") {
      return {
        title: "Fuel Logs",
        sub: "Log fuel used on your deliveries",
      };
    }
    if (role === "financial_analyst") {
      return {
        title: "Fuel & Cost Tracking",
        sub: "Expenses, fuel spend, and operational charges across assets",
      };
    }
    return {
      title: "Fuel & Expenses",
      sub: "Track fuel logs, tolls, and operational charges across assets",
    };
  }

  if (page === "maintenance") {
    return {
      title: "Maintenance Orders",
      sub: "Open and track vehicle maintenance, scheduling, and shop logs",
    };
  }

  // analytics
  if (role === "financial_analyst") {
    return {
      title: "Profitability & ROI",
      sub: "Operational costs, fuel efficiency, and vehicle returns for finance review",
    };
  }
  return {
    title: "Analytics & Reports",
    sub: "Fuel efficiency, operational cost, and vehicle ROI across the fleet",
  };
}

export function getHomeRoute(user: AuthUser | null | undefined): AppRoute {
  if (!user) return ROUTES.dashboard;
  return ROLE_HOME[user.role] ?? ROUTES.dashboard;
}

export function canAccessRoute(user: AuthUser | null | undefined, path: string): boolean {
  if (!user) return false;
  const allowed = ROLE_ROUTES[user.role];
  if (!allowed) return false;
  return allowed.some((route) => (route === "/" ? path === "/" : path === route || path.startsWith(`${route}/`)));
}

export function getNavItemsForRole(user: AuthUser | null | undefined): NavItem[] {
  if (!user) return [];
  return ROLE_NAV[user.role] ?? [];
}

/** Alias used by AppShell */
export const navItemsForRole = getNavItemsForRole;
