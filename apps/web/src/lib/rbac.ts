import type { AuthUser } from "../types";

export function hasRole(user: AuthUser | null | undefined, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/** Create/update vehicles (matches API create roles) */
export function canManageFleet(user: AuthUser | null | undefined): boolean {
  return hasRole(user, "fleet_manager", "financial_analyst");
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
