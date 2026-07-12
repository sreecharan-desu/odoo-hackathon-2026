export type ApiErrorBody = {
  error?: string;
  message?: string;
};

export type HealthResponse = {
  status: string;
  service: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type Vehicle = {
  id: number;
  registration_number: string;
  name: string;
  vehicle_type: string;
  max_load_kg: number;
  odometer: number;
  acquisition_cost: number;
  status: string;
  region: string | null;
};

export type Driver = {
  id: number;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  contact_number: string | null;
  safety_score: number;
  status: string;
};

export type Trip = {
  id: number;
  source: string;
  destination: string;
  vehicle_id: number;
  driver_id: number;
  cargo_weight: number;
  planned_distance: number;
  status: string;
  final_odometer: number | null;
  fuel_consumed: number | null;
  created_at: string | null;
};

export type MaintenanceLog = {
  id: number;
  vehicle_id: number;
  title: string;
  description: string | null;
  estimated_cost: number;
  status: string;
  opened_at: string | null;
  closed_at: string | null;
};

export type FuelLog = {
  id: number;
  vehicle_id: number;
  liters: number;
  cost: number;
  trip_id: number | null;
  logged_at: string | null;
};

export type Expense = {
  id: number;
  vehicle_id: number;
  category: string;
  amount: number;
  note: string | null;
  logged_at: string | null;
};

export type DashboardKpis = {
  active_vehicles: number;
  available_vehicles: number;
  vehicles_on_trip: number;
  vehicles_in_shop: number;
  active_trips: number;
  pending_trips: number;
  drivers_on_duty: number;
  fleet_utilization_pct: number;
  safety_alerts: number;
};
