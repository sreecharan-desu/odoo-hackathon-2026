import { Card, Spinner } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { apiGet, endpoints } from "../lib/api";
import type { DashboardKpis, Trip } from "../types";

export default function DashboardPage() {
  const { data: kpis, error: kpiError, loading: kpiLoading } = useAsync<DashboardKpis>(
    () => apiGet(endpoints.kpis),
    [],
  );

  const { data: trips, error: tripsError, loading: tripsLoading } = useAsync<Trip[]>(
    () => apiGet(endpoints.trips),
    [],
  );

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
            <p style={{ margin: "var(--space-1) 0 0", fontSize: "0.75rem", color: "var(--color-muted)" }}>
              In active maintenance
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Drivers On Duty</p>
            <p className="stat-card-value">{kpis.drivers_on_duty}</p>
            <p style={{ margin: "var(--space-1) 0 0", fontSize: "0.75rem", color: "var(--color-muted)" }}>
              Assigned to active trips
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Fleet Utilization</p>
            <p className="stat-card-value">{kpis.fleet_utilization_pct.toFixed(1)}%</p>
            <p style={{ margin: "var(--space-1) 0 0", fontSize: "0.75rem", color: "var(--color-muted)" }}>
              On trip vs Total fleet
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Safety Alerts</p>
            <p className="stat-card-value" style={{ color: kpis.safety_alerts > 0 ? "var(--color-error)" : "inherit" }}>
              {kpis.safety_alerts}
            </p>
            <p style={{ margin: "var(--space-1) 0 0", fontSize: "0.75rem", color: "var(--color-muted)" }}>
              Requires attention
            </p>
          </div>
        </div>
      ) : null}

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
              <table className="ops-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>ID</th>
                    <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>Source</th>
                    <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>Destination</th>
                    <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>Cargo Weight</th>
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
                      <td style={{ padding: "var(--space-2) 0" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: trip.status === "Completed" ? "rgba(40, 167, 69, 0.15)" :
                                      trip.status === "Dispatched" ? "rgba(0, 123, 255, 0.15)" :
                                      trip.status === "Cancelled" ? "rgba(220, 53, 69, 0.15)" :
                                      "rgba(108, 117, 125, 0.15)",
                          color: trip.status === "Completed" ? "#28a745" :
                                 trip.status === "Dispatched" ? "#007bff" :
                                 trip.status === "Cancelled" ? "#dc3545" :
                                 "#6c757d"
                        }}>
                          {trip.status}
                        </span>
                      </td>
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
