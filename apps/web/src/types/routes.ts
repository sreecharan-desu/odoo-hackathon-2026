export const ROUTES = {
  login: "/login",
  dashboard: "/",
  fleet: "/fleet",
  drivers: "/drivers",
  trips: "/trips",
  maintenance: "/maintenance",
  fuelExpenses: "/fuel-expenses",
  analytics: "/analytics",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export type NavItem = {
  label: string;
  path: AppRoute;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: ROUTES.dashboard },
  { label: "Fleet", path: ROUTES.fleet },
  { label: "Drivers", path: ROUTES.drivers },
  { label: "Trips", path: ROUTES.trips },
  { label: "Maintenance", path: ROUTES.maintenance },
  { label: "Fuel & Expenses", path: ROUTES.fuelExpenses },
  { label: "Analytics", path: ROUTES.analytics },
];
