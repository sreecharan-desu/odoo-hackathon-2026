export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  trips: "/trips",
  fleet: "/fleet",
  maintenance: "/maintenance",
} as const;

export const SIDEBAR_LABELS = [
  { path: ROUTES.dashboard, label: "Dashboard" },
  { path: ROUTES.trips, label: "Trips" },
  { path: ROUTES.fleet, label: "Fleet" },
  { path: ROUTES.maintenance, label: "Maintenance" },
];

export const STATUS_COLORS = {
  Available: "success",
  "On Trip": "primary",
  "In Shop": "error",
  Maintenance: "warning",
  Retired: "muted",
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
