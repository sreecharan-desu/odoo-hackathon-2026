import { useMemo, useState } from "react";
import { Card, Spinner } from "../components/ui";
import { SelectField } from "../components/forms";
import { useAsync } from "../hooks/useAsync";
import { apiGet, apiGetItems, endpoints } from "../lib/api";
import type { DashboardKpis, Trip, Vehicle } from "../types";

export default function DashboardPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const { data: kpis, error: kpiError, loading: kpiLoading } = useAsync<DashboardKpis>(
    () => apiGet(endpoints.kpis),
    [],
  );

  const { data: trips, error: tripsError, loading: tripsLoading } = useAsync<Trip[]>(
    () => apiGetItems<Trip>(endpoints.trips, { limit: 10 }),
    [],
  );

  const { data: vehicles, error: vehiclesError, loading: vehiclesLoading } = useAsync<Vehicle[]>(
    () => apiGetItems<Vehicle>(endpoints.vehicles),
    [],
  );

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set((vehicles ?? []).map((v) => v.vehicle_type).filter(Boolean))).sort();
    return [{ value: "", label: "All types" }, ...types.map((t) => ({ value: t, label: t }))];
  }, [vehicles]);

  const regionOptions = useMemo(() => {
    const regions = Array.from(
      new Set((vehicles ?? []).map((v) => v.region).filter((r): r is string => Boolean(r))),
    ).sort();
    return [{ value: "", label: "All regions" }, ...regions.map((r) => ({ value: r, label: r }))];
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return (vehicles ?? []).filter((v) => {
      if (typeFilter && v.vehicle_type !== typeFilter) return false;
      if (statusFilter && v.status !== statusFilter) return false;
      if (regionFilter && v.region !== regionFilter) return false;
      return true;
    });
  }, [vehicles, typeFilter, statusFilter, regionFilter]);

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="text-muted">Real-time fleet performance & operations overview</p>
      </div>

      {kpiLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-4)" }}>
          <Spinner />
        </div>
      ) : kpiError ? (
        <p className="error">Failed to load KPIs: {kpiError}</p>
      ) : kpis ? (
        <div className="page-grid">
          <div className="stat-card">
            <p className="stat-card-label">Active Vehicles</p>
            <p className="stat-card-value">{kpis.active_vehicles}</p>
            <p style={{ margin: "var(--space-1) 0 0", fontSize: "0.75rem", color: "var(--color-muted)" }}>
              {kpis.available_vehicles} Available | {kpis.vehicles_on_trip} On Trip
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Vehicles In Shop</p>
            <p className="stat-card-value" style={{ color: kpis.vehicles_in_shop > 0 ? "orange" : "inherit" }}>
              {kpis.vehicles_in_shop}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Active Trips</p>
            <p className="stat-card-value">{kpis.active_trips}</p>
            <p style={{ margin: "var(--space-1) 0 0", fontSize: "0.75rem", color: "var(--color-muted)" }}>
              {kpis.pending_trips} Pending
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Drivers On Duty</p>
            <p className="stat-card-value">{kpis.drivers_on_duty}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Fleet Utilization</p>
            <p className="stat-card-value">{kpis.fleet_utilization_pct.toFixed(1)}%</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Safety Alerts</p>
            <p className="stat-card-value" style={{ color: kpis.safety_alerts > 0 ? "var(--color-error)" : "inherit" }}>
              {kpis.safety_alerts}
            </p>
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: "var(--space-4)" }}>
        <Card>
          <h3 style={{ margin: "0 0 var(--space-3)" }}>Fleet filters</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
            <SelectField
              id="dash-type"
              label="Vehicle type"
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
            <SelectField
              id="dash-status"
              label="Status"
              options={[
                { value: "", label: "All statuses" },
                { value: "Available", label: "Available" },
                { value: "On Trip", label: "On Trip" },
                { value: "In Shop", label: "In Shop" },
                { value: "Retired", label: "Retired" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <SelectField
              id="dash-region"
              label="Region"
              options={regionOptions}
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            />
          </div>

          {vehiclesLoading ? (
            <Spinner />
          ) : vehiclesError ? (
            <p className="error">Failed to load vehicles: {vehiclesError}</p>
          ) : (
            <>
              <p className="text-muted" style={{ marginTop: 0 }}>
                Showing {filteredVehicles.length} of {vehicles?.length ?? 0} vehicles
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Reg</th>
                      <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Type</th>
                      <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Region</th>
                      <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Status</th>
                      <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Max load</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.slice(0, 12).map((v) => (
                      <tr key={v.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "var(--space-2)", fontWeight: 600 }}>{v.registration_number}</td>
                        <td style={{ padding: "var(--space-2)" }}>{v.vehicle_type}</td>
                        <td style={{ padding: "var(--space-2)" }}>{v.region ?? "—"}</td>
                        <td style={{ padding: "var(--space-2)" }}>{v.status}</td>
                        <td style={{ padding: "var(--space-2)" }}>{v.max_load_kg} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>

      <div style={{ marginTop: "var(--space-4)" }}>
        <Card>
          <h3 style={{ margin: "0 0 var(--space-3)" }}>Recent Trips</h3>
          {tripsLoading ? (
            <Spinner />
          ) : tripsError ? (
            <p className="error">Failed to load recent trips: {tripsError}</p>
          ) : trips && trips.length === 0 ? (
            <p className="page-empty">No trips registered yet.</p>
          ) : trips ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>ID</th>
                    <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>Source</th>
                    <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>Destination</th>
                    <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>Cargo</th>
                    <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.slice(0, 5).map((trip) => (
                    <tr key={trip.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "var(--space-2) 0" }}>#{trip.id}</td>
                      <td style={{ padding: "var(--space-2) 0" }}>{trip.source}</td>
                      <td style={{ padding: "var(--space-2) 0" }}>{trip.destination}</td>
                      <td style={{ padding: "var(--space-2) 0" }}>{trip.cargo_weight} kg</td>
                      <td style={{ padding: "var(--space-2) 0" }}>{trip.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      </div>
    </>
  );
}
