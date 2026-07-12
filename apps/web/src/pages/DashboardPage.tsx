import { useMemo, useState } from "react";
import { Card, Spinner } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { apiGet, apiGetItems, endpoints } from "../lib/api";
import type { DashboardKpis, Trip, Vehicle, Driver } from "../types";
import "../components/layout/shell.css";

export default function DashboardPage() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");

  const { data: kpis, error: kpiError, loading: kpiLoading } = useAsync<DashboardKpis>(
    () => apiGet(endpoints.kpis),
    [],
  );

  const { data: trips, error: tripsError, loading: tripsLoading } = useAsync<Trip[]>(
    () => apiGetItems<Trip>(endpoints.trips, { limit: 50 }),
    [],
  );

  const { data: vehicles, error: vehiclesError, loading: vehiclesLoading } = useAsync<Vehicle[]>(
    () => apiGetItems<Vehicle>(endpoints.vehicles),
    [],
  );

  const { data: drivers, error: driversError, loading: driversLoading } = useAsync<Driver[]>(
    () => apiGetItems<Driver>(endpoints.drivers),
    [],
  );

  const loading = kpiLoading || tripsLoading || vehiclesLoading || driversLoading;
  const error = kpiError || tripsError || vehiclesError || driversError;

  const regionOptions = useMemo(() => {
    const regions = Array.from(
      new Set((vehicles ?? []).map((v) => v.region).filter((r): r is string => Boolean(r))),
    ).sort();
    return regions;
  }, [vehicles]);

  const typeOptions = useMemo(() => {
    return Array.from(new Set((vehicles ?? []).map((v) => v.vehicle_type).filter(Boolean))).sort();
  }, [vehicles]);

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

  const vehicleList = vehicles ?? [];
  const tripList = trips ?? [];
  const driverList = drivers ?? [];

  const counts = {
    Available: vehicleList.filter((v) => v.status === "Available").length,
    OnTrip: vehicleList.filter((v) => v.status === "On Trip").length,
    InShop: vehicleList.filter((v) => v.status === "In Shop" || v.status === "Maintenance").length,
    Retired: vehicleList.filter((v) => v.status === "Retired").length,
  };
  const totalVehicles = vehicleList.length || 1;

  const filteredTrips = tripList.filter((trip) => {
    const v = vehicleList.find((veh) => veh.id === trip.vehicle_id);
    if (!v) return true;
    const matchesType = typeFilter === "All" || v.vehicle_type === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    const matchesRegion = regionFilter === "All" || v.region === regionFilter;
    return matchesType && matchesStatus && matchesRegion;
  });

  // SVG circular segments calculation parameters
  // Circle radius = 70. Circumference = 2 * PI * r = 439.82
  const r = 70;
  const circumference = 2 * Math.PI * r;
  
  const segments = [
    { label: "Available", count: counts.Available, color: "#ffffff" },
    { label: "On Trip", count: counts.OnTrip, color: "#cccccc" },
    { label: "In Shop", count: counts.InShop, color: "#777777" },
    { label: "Retired", count: counts.Retired, color: "#333333" },
  ];

  let accumulatedCircumference = 0;

  return (
    <>
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p className="text-muted">Real-time fleet performance & operations monitoring</p>
      </div>

      {/* Responsive Filters */}
      <div className="dashboard-filters" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <span className="dashboard-filters-label">Filters</span>
        <select
          className="dashboard-filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">Vehicle Type: All</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="dashboard-filter-select"
          value={statusFilter}
          onChange={(e) => { setTypeFilter("All"); setStatusFilter(e.target.value); }}
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
          {regionOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* KPI 7 Data Cards Grid */}
      {kpis && (
        <div 
          className="page-grid" 
          style={{ 
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", 
            marginBottom: "var(--space-4)",
            gap: "var(--space-2)"
          }}
        >
          <div className="stat-card" style={{ transition: "none", border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none" }}>
            <p className="stat-card-label" style={{ fontSize: "0.75rem", letterSpacing: "0.02em" }}>ACTIVE VEHICLES</p>
            <p className="stat-card-value" style={{ color: "#ffffff" }}>{kpis.active_vehicles}</p>
          </div>
          <div className="stat-card" style={{ transition: "none", border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none" }}>
            <p className="stat-card-label" style={{ fontSize: "0.75rem", letterSpacing: "0.02em" }}>AVAILABLE VEHICLES</p>
            <p className="stat-card-value" style={{ color: "#ffffff" }}>{kpis.available_vehicles}</p>
          </div>
          <div className="stat-card" style={{ transition: "none", border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none" }}>
            <p className="stat-card-label" style={{ fontSize: "0.75rem", letterSpacing: "0.02em" }}>VEHICLES IN MAINT.</p>
            <p className="stat-card-value" style={{ color: "#ffffff" }}>{kpis.vehicles_in_shop}</p>
          </div>
          <div className="stat-card" style={{ transition: "none", border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none" }}>
            <p className="stat-card-label" style={{ fontSize: "0.75rem", letterSpacing: "0.02em" }}>ACTIVE TRIPS</p>
            <p className="stat-card-value" style={{ color: "#ffffff" }}>{kpis.active_trips}</p>
          </div>
          <div className="stat-card" style={{ transition: "none", border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none" }}>
            <p className="stat-card-label" style={{ fontSize: "0.75rem", letterSpacing: "0.02em" }}>PENDING TRIPS</p>
            <p className="stat-card-value" style={{ color: "#ffffff" }}>{kpis.pending_trips}</p>
          </div>
          <div className="stat-card" style={{ transition: "none", border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none" }}>
            <p className="stat-card-label" style={{ fontSize: "0.75rem", letterSpacing: "0.02em" }}>DRIVERS ON DUTY</p>
            <p className="stat-card-value" style={{ color: "#ffffff" }}>{kpis.drivers_on_duty}</p>
          </div>
          <div className="stat-card" style={{ transition: "none", border: "1px solid rgba(255, 255, 255, 0.06)", boxShadow: "none" }}>
            <p className="stat-card-label" style={{ fontSize: "0.75rem", letterSpacing: "0.02em" }}>FLEET UTILIZATION</p>
            <p className="stat-card-value" style={{ color: "#ffffff" }}>{kpis.fleet_utilization_pct.toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Full-width Stack Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", width: "100%" }}>
        
        {/* Vehicle Stats Pie/Donut Chart Container */}
        <Card style={{ width: "100%", padding: "var(--space-4)" }}>
          <h3 style={{ margin: "0 0 var(--space-4)", fontSize: "1.1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
            VEHICLE STATUS
          </h3>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-around",
            gap: "var(--space-4)",
            padding: "var(--space-2) 0"
          }}>
            {/* SVG Donut Chart */}
            <div style={{ position: "relative", width: "220px", height: "220px" }}>
              <svg viewBox="0 0 200 200" width="100%" height="100%">
                {/* Base background circle */}
                <circle 
                  cx="100" 
                  cy="100" 
                  r={r} 
                  fill="transparent" 
                  stroke="rgba(255, 255, 255, 0.02)" 
                  strokeWidth="20" 
                />
                
                {segments.map((seg) => {
                  const pct = totalVehicles > 0 ? seg.count / totalVehicles : 0;
                  const strokeDasharray = `${pct * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedCircumference;
                  accumulatedCircumference += pct * circumference;
                  
                  if (seg.count === 0) return null;
                  
                  return (
                    <circle
                      key={seg.label}
                      cx="100"
                      cy="100"
                      r={r}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      transform="rotate(-90 100 100)"
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                  );
                })}
              </svg>
              {/* Central text badge */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "#ffffff" }}>{totalVehicles}</span>
                <span style={{ fontSize: "0.6875rem", fontWeight: "700", color: "rgba(255, 255, 255, 0.4)", letterSpacing: "0.08em", marginTop: "2px" }}>
                  TOTAL ASSETS
                </span>
              </div>
            </div>

            {/* Monochrome Legend Table */}
            <div style={{ flex: 1, minWidth: "280px", maxWidth: "450px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {segments.map((seg) => {
                    const pct = totalVehicles > 0 ? ((seg.count / totalVehicles) * 100).toFixed(0) : "0";
                    return (
                      <tr key={seg.label} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: seg.color,
                            border: "1px solid rgba(255, 255, 255, 0.1)"
                          }} />
                          <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff" }}>{seg.label}</span>
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "right", fontSize: "0.875rem", fontWeight: "bold", color: "#ffffff" }}>
                          {seg.count}
                        </td>
                        <td style={{ padding: "10px 0", textAlign: "right", fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.4)" }}>
                          {pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Recent Trips Table Container */}
        <Card style={{ width: "100%", padding: "var(--space-4)" }}>
          <h3 style={{ margin: "0 0 var(--space-3)", fontSize: "1.1rem" }}>RECENT TRIPS</h3>
          {filteredTrips.length === 0 ? (
            <p className="page-empty">No recent trips match the filter criteria.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="ops-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "10px 0", color: "var(--color-muted)" }}>TRIP</th>
                    <th style={{ padding: "10px 0", color: "var(--color-muted)" }}>VEHICLE</th>
                    <th style={{ padding: "10px 0", color: "var(--color-muted)" }}>DRIVER</th>
                    <th style={{ padding: "10px 0", color: "var(--color-muted)" }}>STATUS</th>
                    <th style={{ padding: "10px 0", color: "var(--color-muted)" }}>ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.slice(0, 10).map((trip) => {
                    const v = vehicleList.find((veh) => veh.id === trip.vehicle_id);
                    const d = driverList.find((drv) => drv.id === trip.driver_id);

                    let eta = "—";
                    if (trip.status === "Dispatched") {
                      eta = "45 min";
                    } else if (trip.status === "Draft") {
                      eta = "Awaiting vehicle";
                    }

                    // Strict black & white badge styling
                    const getBadgeStyle = (status: string) => {
                      switch (status) {
                        case "Completed":
                          return {
                            border: "1px solid #ffffff",
                            background: "rgba(255, 255, 255, 0.06)",
                            color: "#ffffff"
                          };
                        case "Dispatched":
                          return {
                            border: "1px dashed rgba(255, 255, 255, 0.4)",
                            background: "rgba(255, 255, 255, 0.03)",
                            color: "rgba(255, 255, 255, 0.85)"
                          };
                        case "Cancelled":
                          return {
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            background: "transparent",
                            color: "rgba(255, 255, 255, 0.4)",
                            textDecoration: "line-through"
                          };
                        default: // Draft / Pending
                          return {
                            border: "1px dotted rgba(255, 255, 255, 0.3)",
                            background: "transparent",
                            color: "rgba(255, 255, 255, 0.6)"
                          };
                      }
                    };

                    return (
                      <tr key={trip.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "12px 0", fontWeight: "bold" }}>TR{String(trip.id).padStart(3, "0")}</td>
                        <td style={{ padding: "12px 0" }}>{v ? v.registration_number : `Vehicle #${trip.vehicle_id}`}</td>
                        <td style={{ padding: "12px 0" }}>{d ? d.name : `Driver #${trip.driver_id}`}</td>
                        <td style={{ padding: "12px 0" }}>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            display: "inline-block",
                            textAlign: "center",
                            ...getBadgeStyle(trip.status)
                          }}>
                            {trip.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 0", color: "var(--color-muted)", fontSize: "0.875rem" }}>{eta}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
