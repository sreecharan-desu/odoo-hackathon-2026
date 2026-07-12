import { useState, useEffect } from "react";
import { Card, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { apiGet, endpoints } from "../lib/api";
import type { DashboardKpis, Trip, Vehicle, Driver } from "../types";
import "../components/layout/shell.css";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Scoped Access check (Dashboard is scoped to Dispatcher / Fleet Manager / Admin)
  const isAllowed = user?.role === "dispatcher" || user?.role === "fleet_manager" || user?.id === 0;

  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");

  useEffect(() => {
    if (!isAllowed) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    Promise.all([
      apiGet<DashboardKpis>(endpoints.kpis),
      apiGet<Trip[]>(endpoints.trips),
      apiGet<Vehicle[]>(endpoints.vehicles),
      apiGet<Driver[]>(endpoints.drivers)
    ])
      .then(([kpiData, tripData, vehicleData, driverData]) => {
        setKpis(kpiData);
        setTrips(tripData);
        setVehicles(vehicleData);
        setDrivers(driverData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAllowed]);

  if (!isAllowed) {
    return (
      <div className="access-scoped-wrapper">
        <Card style={{ width: "100%", maxWidth: "500px", padding: "var(--space-4)", textAlign: "center" }}>
          <h3 style={{ color: "var(--color-error)", margin: "0 0 var(--space-2)" }}>Access Scoped</h3>
          <p className="text-muted">This page is scoped for Dispatcher and Fleet Manager roles.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-4)" }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="error" style={{ margin: "var(--space-4)" }}>{error}</p>;
  }

  // Calculate dynamic vehicle status counts for the chart
  const counts = {
    Available: vehicles.filter(v => v.status === "Available").length,
    OnTrip: vehicles.filter(v => v.status === "On Trip").length,
    InShop: vehicles.filter(v => v.status === "In Shop").length,
    Retired: vehicles.filter(v => v.status === "Retired").length,
  };
  const totalVehicles = vehicles.length || 1;

  // Filter trips based on filters
  const filteredTrips = trips.filter(trip => {
    const v = vehicles.find(veh => veh.id === trip.vehicle_id);
    if (!v) return true;
    
    const matchesType = typeFilter === "All" || v.vehicle_type === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    const matchesRegion = regionFilter === "All" || v.region === regionFilter;
    
    return matchesType && matchesStatus && matchesRegion;
  });

  return (
    <>
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p className="text-muted">Real-time fleet performance & operations monitoring</p>
      </div>

      {/* Top Filters */}
      <div className="dashboard-filters">
        <span className="dashboard-filters-label">Filters</span>
        <select
          className="dashboard-filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">Vehicle Type: All</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
        </select>
        <select
          className="dashboard-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>
        <select
          className="dashboard-filter-select"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          <option value="All">Region: All</option>
          <option value="West">West</option>
          <option value="East">East</option>
          <option value="North">North</option>
          <option value="South">South</option>
        </select>
      </div>

      {/* 7 KPI Cards */}
      {kpis && (
        <div className="page-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: "var(--space-4)" }}>
          <div className="stat-card" style={{ borderLeft: "4px solid #3b82f6" }}>
            <p className="stat-card-label">ACTIVE VEHICLES</p>
            <p className="stat-card-value">{kpis.active_vehicles}</p>
          </div>
          <div className="stat-card" style={{ borderLeft: "4px solid #28a745" }}>
            <p className="stat-card-label">AVAILABLE VEHICLES</p>
            <p className="stat-card-value">{kpis.available_vehicles}</p>
          </div>
          <div className="stat-card" style={{ borderLeft: "4px solid #ffc107" }}>
            <p className="stat-card-label">VEHICLES IN MAINTENANCE</p>
            <p className="stat-card-value" style={{ color: "#ffc107" }}>{kpis.vehicles_in_shop}</p>
          </div>
          <div className="stat-card" style={{ borderLeft: "4px solid #17a2b8" }}>
            <p className="stat-card-label">ACTIVE TRIPS</p>
            <p className="stat-card-value">{kpis.active_trips}</p>
          </div>
          <div className="stat-card" style={{ borderLeft: "4px solid #6c757d" }}>
            <p className="stat-card-label">PENDING TRIPS</p>
            <p className="stat-card-value">{kpis.pending_trips}</p>
          </div>
          <div className="stat-card" style={{ borderLeft: "4px solid #6f42c1" }}>
            <p className="stat-card-label">DRIVERS ON DUTY</p>
            <p className="stat-card-value">{kpis.drivers_on_duty}</p>
          </div>
          <div className="stat-card" style={{ borderLeft: "4px solid #fd7e14" }}>
            <p className="stat-card-label">FLEET UTILIZATION</p>
            <p className="stat-card-value">{kpis.fleet_utilization_pct.toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Split Pane: Trips Table on Left, Vehicle Status Bars on Right */}
      <div className="split-pane-layout">
        <div className="split-pane-main">
          <Card>
            <h3 style={{ margin: "0 0 var(--space-3)" }}>RECENT TRIPS</h3>
            {filteredTrips.length === 0 ? (
              <p className="page-empty">No recent trips match the filter criteria.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="ops-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>TRIP</th>
                      <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>VEHICLE</th>
                      <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>DRIVER</th>
                      <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>STATUS</th>
                      <th style={{ padding: "var(--space-2) 0", color: "var(--color-muted)" }}>ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.slice(0, 10).map((trip) => {
                      const v = vehicles.find(veh => veh.id === trip.vehicle_id);
                      const d = drivers.find(drv => drv.id === trip.driver_id);
                      
                      // Format ETA
                      let eta = "—";
                      if (trip.status === "Dispatched") {
                        eta = "45 min";
                      } else if (trip.status === "Draft") {
                        eta = "Awaiting vehicle";
                      }

                      return (
                        <tr key={trip.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                          <td style={{ padding: "var(--space-2) 0", fontWeight: "bold" }}>TR{String(trip.id).padStart(3, "0")}</td>
                          <td style={{ padding: "var(--space-2) 0" }}>{v ? v.registration_number : `Vehicle #${trip.vehicle_id}`}</td>
                          <td style={{ padding: "var(--space-2) 0" }}>{d ? d.name : `Driver #${trip.driver_id}`}</td>
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
                          <td style={{ padding: "var(--space-2) 0", color: "var(--color-muted)", fontSize: "0.875rem" }}>{eta}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="split-pane-side">
          <Card>
            <h3 style={{ margin: "0 0 var(--space-4)" }}>VEHICLE STATUS</h3>
            
            <div className="progress-chart-row">
              <span className="progress-chart-label">Available</span>
              <div className="progress-chart-bar-container">
                <div className="progress-chart-bar" style={{ background: "#28a745", width: `${(counts.Available / totalVehicles) * 100}%` }} />
              </div>
              <span className="progress-chart-value">{counts.Available}</span>
            </div>

            <div className="progress-chart-row">
              <span className="progress-chart-label">On Trip</span>
              <div className="progress-chart-bar-container">
                <div className="progress-chart-bar" style={{ background: "#007bff", width: `${(counts.OnTrip / totalVehicles) * 100}%` }} />
              </div>
              <span className="progress-chart-value">{counts.OnTrip}</span>
            </div>

            <div className="progress-chart-row">
              <span className="progress-chart-label">In Shop</span>
              <div className="progress-chart-bar-container">
                <div className="progress-chart-bar" style={{ background: "#ffc107", width: `${(counts.InShop / totalVehicles) * 100}%` }} />
              </div>
              <span className="progress-chart-value">{counts.InShop}</span>
            </div>

            <div className="progress-chart-row">
              <span className="progress-chart-label">Retired</span>
              <div className="progress-chart-bar-container">
                <div className="progress-chart-bar" style={{ background: "#dc3545", width: `${(counts.Retired / totalVehicles) * 100}%` }} />
              </div>
              <span className="progress-chart-value">{counts.Retired}</span>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
