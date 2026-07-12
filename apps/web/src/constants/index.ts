export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  fleet: "/fleet",
  drivers: "/drivers",
  trips: "/trips",
  maintenance: "/maintenance",
  fuelExpenses: "/fuel-expenses",
  analytics: "/analytics",
} as const;

export const SIDEBAR_LABELS = [
  { path: ROUTES.dashboard, label: "Dashboard" },
  { path: ROUTES.fleet, label: "Fleet" },
  { path: ROUTES.drivers, label: "Drivers" },
  { path: ROUTES.trips, label: "Trips" },
  { path: ROUTES.maintenance, label: "Maintenance" },
  { path: ROUTES.fuelExpenses, label: "Fuel & Expenses" },
  { path: ROUTES.analytics, label: "Analytics" },
];

export const STATUS_COLORS = {
  Available: "success",
  "On Trip": "primary",
  "In Shop": "error",
  Maintenance: "warning",
  Retired: "muted",
  "Off Duty": "muted",
  Suspended: "error",
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
