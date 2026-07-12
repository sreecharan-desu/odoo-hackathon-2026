import { useMemo, useState } from "react";
import { Card, Spinner } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import { roleWorkspace } from "../lib/rbac";
import { apiGet, apiGetItems, endpoints } from "../lib/api";
import type { DashboardKpis, Trip, Vehicle, Driver } from "../types";
import "../components/layout/shell.css";

/* ─── Semantic chart colors (stay across themes) ─── */
const CHART = {
  green:  "#22c55e",
  amber:  "#f59e0b",
  red:    "#ef4444",
  blue:   "#3b82f6",
};

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";

/* ─── Status badge ─────────────────────────────────── */
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  Completed:  { background: "var(--color-positive-bg)",  color: "var(--color-positive)",  border: "1px solid var(--color-positive)" },
  Dispatched: { background: "rgba(59,130,246,0.10)",     color: "#3b82f6",                border: "1px dashed #3b82f6" },
  Cancelled:  { background: "var(--color-danger-bg)",    color: "var(--color-danger)",     border: "1px solid var(--color-danger)",  textDecoration: "line-through" },
  Draft:      { background: "var(--color-surface-2)",    color: "var(--color-muted)",      border: "1px dotted var(--color-border)" },
  Active:     { background: "var(--color-positive-bg)",  color: "var(--color-positive)",  border: "1px solid var(--color-positive)" },
  Inactive:   { background: "var(--color-danger-bg)",    color: "var(--color-danger)",     border: "1px solid var(--color-danger)"  },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.Draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "0.72rem", fontWeight: 700,
      ...s,
    }}>
      {status}
    </span>
  );
}

/* ─── KPI card ─────────────────────────────────────── */
function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "12px",
      padding: "20px 18px",
      display: "flex", flexDirection: "column", gap: "6px",
      minWidth: 0,
      boxShadow: "var(--shadow-soft)",
    }}>
      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: "0.74rem", color: "var(--color-muted-2)" }}>{sub}</span>}
    </div>
  );
}

/* ─── Donut chart ───────────────────────────────────── */
interface DonutSeg { label: string; count: number; color: string }
function DonutChart({ segments, total }: { segments: DonutSeg[]; total: number }) {
  const r = 68, circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-around", gap: "36px", padding: "8px 0" }}>
      <div style={{ position: "relative", width: "200px", height: "200px", flexShrink: 0 }}>
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <circle cx="100" cy="100" r={r} fill="transparent" stroke="var(--color-surface-2)" strokeWidth="22" />
          {segments.map((seg) => {
            const pct = total > 0 ? seg.count / total : 0;
            const offset = -acc;
            acc += pct * circ;
            if (seg.count === 0) return null;
            return (
              <circle key={seg.label} cx="100" cy="100" r={r} fill="transparent"
                stroke={seg.color} strokeWidth="22"
                strokeDasharray={`${pct * circ} ${circ}`}
                strokeDashoffset={offset}
                transform="rotate(-90 100 100)"
                style={{ transition: "stroke-dasharray 0.6s ease" }} />
            );
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--color-text)" }}>{total}</span>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-muted)", marginTop: "2px" }}>VEHICLES</span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: "200px", maxWidth: "320px" }}>
        {segments.map((seg) => {
          const pct = total > 0 ? ((seg.count / total) * 100).toFixed(0) : "0";
          return (
            <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: seg.color, flexShrink: 0 }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text)", flex: 1 }}>{seg.label}</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text)" }}>{seg.count}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", minWidth: "34px", textAlign: "right" }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Section title ─────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)" }}>
      <h3 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>
        {children}
      </h3>
    </div>
  );
}

/* ─── Table helpers ──────────────────────────────────── */
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "10px 10px 10px 0", color: "var(--color-muted)", fontWeight: 600, fontSize: "0.68rem", letterSpacing: "0.09em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "12px 10px 12px 0", fontSize: "0.875rem", color: "var(--color-text)", borderBottom: "1px solid var(--color-border)", ...style }}>{children}</td>;
}

/* ─── Trips table ─────────────────────────────────────── */
function TripsTable({ trips, vehicles, drivers }: { trips: Trip[]; vehicles: Vehicle[]; drivers: Driver[] }) {
  if (!trips.length) return <p style={{ color: "var(--color-muted)", textAlign: "center", padding: "32px 0", fontSize: "0.875rem" }}>No trips found.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
            <Th>Trip</Th><Th>Vehicle</Th><Th>Driver</Th><Th>Route</Th><Th>Status</Th><Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {trips.slice(0, 12).map((trip) => {
            const v = vehicles.find((x) => x.id === trip.vehicle_id);
            const d = drivers.find((x) => x.id === trip.driver_id);
            return (
              <tr key={trip.id}>
                <Td><span style={{ fontWeight: 700, fontFamily: "monospace" }}>TR{String(trip.id).padStart(3, "0")}</span></Td>
                <Td>{v?.registration_number ?? `#${trip.vehicle_id}`}</Td>
                <Td>{d?.name ?? `#${trip.driver_id}`}</Td>
                <Td style={{ color: "var(--color-muted)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {trip.source} → {trip.destination}
                </Td>
                <Td><StatusBadge status={trip.status} /></Td>
                <Td style={{ color: "var(--color-muted)", whiteSpace: "nowrap" }}>{fmtDate(trip.created_at)}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════ ROLE VIEWS ═══════════════════════════════════ */

function FleetManagerDashboard({ kpis, trips, vehicles, drivers, typeFilter, setTypeFilter, statusFilter, setStatusFilter, regionFilter, setRegionFilter, regionOptions, typeOptions }: any) {
  const vehicleList: Vehicle[] = vehicles ?? [];
  const tripList: Trip[]       = trips ?? [];
  const driverList: Driver[]   = drivers ?? [];

  const counts = {
    Available: vehicleList.filter((v) => v.status === "Available").length,
    OnTrip:    vehicleList.filter((v) => v.status === "On Trip").length,
    InShop:    vehicleList.filter((v) => v.status === "In Shop" || v.status === "Maintenance").length,
    Retired:   vehicleList.filter((v) => v.status === "Retired").length,
  };
  const total = vehicleList.length || 1;

  const filteredTrips = tripList.filter((trip) => {
    const v = vehicleList.find((veh) => veh.id === trip.vehicle_id);
    if (!v) return true;
    return (typeFilter === "All" || v.vehicle_type === typeFilter)
        && (statusFilter === "All" || v.status === statusFilter)
        && (regionFilter === "All" || v.region === regionFilter);
  });

  const segs: DonutSeg[] = [
    { label: "Available", count: counts.Available, color: CHART.green },
    { label: "On Trip",   count: counts.OnTrip,    color: CHART.blue  },
    { label: "In Shop",   count: counts.InShop,    color: CHART.amber },
    { label: "Retired",   count: counts.Retired,   color: CHART.red   },
  ];

  return (
    <>
      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "24px" }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>Filters</span>
        {[
          { label: "Vehicle Type", opts: typeOptions,    val: typeFilter,   set: setTypeFilter },
          { label: "Status", opts: ["Available","On Trip","In Shop","Retired"], val: statusFilter, set: (v: string) => { setTypeFilter("All"); setStatusFilter(v); } },
          { label: "Region", opts: regionOptions,        val: regionFilter, set: setRegionFilter },
        ].map(({ label, opts, val, set }) => (
          <select key={label} className="dashboard-filter-select" value={val} onChange={(e) => set(e.target.value)}>
            <option value="All">{label}: All</option>
            {(opts as string[]).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {kpis && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <KpiCard label="Active Vehicles"   value={kpis.active_vehicles} />
          <KpiCard label="Available"         value={kpis.available_vehicles} />
          <KpiCard label="In Maintenance"    value={kpis.vehicles_in_shop} />
          <KpiCard label="Active Trips"      value={kpis.active_trips} />
          <KpiCard label="Pending Trips"     value={kpis.pending_trips} />
          <KpiCard label="Drivers on Duty"   value={kpis.drivers_on_duty} />
          <KpiCard label="Fleet Utilization" value={`${kpis.fleet_utilization_pct?.toFixed(0) ?? 0}%`} />
        </div>
      )}

      <Card style={{ width: "100%", padding: "var(--space-4)", marginBottom: "20px", boxSizing: "border-box" }}>
        <SectionTitle>Vehicle Status Breakdown</SectionTitle>
        <DonutChart segments={segs} total={total} />
      </Card>

      <Card style={{ width: "100%", padding: "var(--space-4)", boxSizing: "border-box" }}>
        <SectionTitle>Recent Trips</SectionTitle>
        <TripsTable trips={filteredTrips} vehicles={vehicleList} drivers={driverList} />
      </Card>
    </>
  );
}

function DriverDashboard({ trips, vehicles, drivers }: any) {
  const tripList: Trip[] = trips ?? [];
  const active    = tripList.filter((t) => t.status === "Dispatched").length;
  const completed = tripList.filter((t) => t.status === "Completed").length;
  const pending   = tripList.filter((t) => t.status === "Draft").length;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <KpiCard label="Active Trips"   value={active}          sub="Currently dispatched" />
        <KpiCard label="Completed"      value={completed}       sub="All time" />
        <KpiCard label="Pending"        value={pending}         sub="Awaiting dispatch" />
        <KpiCard label="Total Assigned" value={tripList.length} sub="Across all time" />
      </div>
      <Card style={{ width: "100%", padding: "var(--space-4)", boxSizing: "border-box" }}>
        <SectionTitle>My Recent Trips</SectionTitle>
        <TripsTable trips={tripList} vehicles={vehicles ?? []} drivers={drivers ?? []} />
      </Card>
    </>
  );
}

function SafetyDashboard({ drivers, trips }: any) {
  const driverList: Driver[] = drivers ?? [];
  const tripList: Trip[]     = trips ?? [];
  const now = new Date();

  const expired      = driverList.filter((d) => d.license_expiry && new Date(d.license_expiry) < now).length;
  const expiringSoon = driverList.filter((d) => {
    if (!d.license_expiry) return false;
    const diff = (new Date(d.license_expiry).getTime() - now.getTime()) / 86400000;
    return diff >= 0 && diff <= 90;
  }).length;
  const active = driverList.filter((d) => d.status === "Active").length;
  const onDuty = tripList.filter((t) => t.status === "Dispatched").length;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <KpiCard label="Total Drivers"      value={driverList.length} />
        <KpiCard label="Active"             value={active}      sub="Available for duty" />
        <KpiCard label="On Duty"            value={onDuty}      sub="Dispatched now" />
        <KpiCard label="Expired Licenses"   value={expired}     sub="Needs renewal" />
        <KpiCard label="Expiring (90 days)" value={expiringSoon} sub="Action required" />
      </div>

      <Card style={{ width: "100%", padding: "var(--space-4)", boxSizing: "border-box" }}>
        <SectionTitle>Driver License Compliance</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <Th>Driver</Th><Th>License No.</Th><Th>Category</Th><Th>Expiry</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {driverList.slice(0, 15).map((d) => {
                const isExpired = d.license_expiry && new Date(d.license_expiry) < now;
                return (
                  <tr key={d.id}>
                    <Td><span style={{ fontWeight: 600 }}>{d.name}</span></Td>
                    <Td style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--color-muted)" }}>{d.license_number ?? "—"}</Td>
                    <Td style={{ color: "var(--color-muted)" }}>{d.license_category ?? "—"}</Td>
                    <Td style={{ color: isExpired ? "var(--color-danger)" : "var(--color-positive)", fontWeight: 600, fontSize: "0.82rem" }}>
                      {fmtDate(d.license_expiry)}{isExpired ? " ⚠" : ""}
                    </Td>
                    <Td><StatusBadge status={d.status ?? "Active"} /></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function FinanceDashboard({ kpis, trips, vehicles, drivers }: any) {
  const tripList: Trip[]       = trips ?? [];
  const vehicleList: Vehicle[] = vehicles ?? [];

  const totalFuelConsumed = tripList.reduce((a, t) => a + (t.fuel_consumed ?? 0), 0);
  const totalDistance     = tripList.reduce((a, t) => a + (t.planned_distance ?? 0), 0);
  const completedTrips    = tripList.filter((t) => t.status === "Completed").length;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <KpiCard label="Fleet Utilization" value={`${kpis?.fleet_utilization_pct?.toFixed(0) ?? 0}%`} sub="Active / Total fleet" />
        <KpiCard label="Active Vehicles"   value={kpis?.active_vehicles ?? "—"} sub="In operation" />
        <KpiCard label="Fuel Consumed"     value={totalFuelConsumed > 0 ? `${totalFuelConsumed.toFixed(0)}L` : "—"} sub="All trips" />
        <KpiCard label="Total Distance"    value={totalDistance > 0 ? `${totalDistance.toFixed(0)} km` : "—"} sub="Planned" />
        <KpiCard label="Completed Trips"   value={completedTrips} sub="Successfully finished" />
      </div>

      <Card style={{ width: "100%", padding: "var(--space-4)", marginBottom: "20px", boxSizing: "border-box" }}>
        <SectionTitle>Vehicle Type Utilization</SectionTitle>
        {(() => {
          const byType: Record<string, { count: number; active: number }> = {};
          vehicleList.forEach((v) => {
            const t = v.vehicle_type ?? "Unknown";
            if (!byType[t]) byType[t] = { count: 0, active: 0 };
            byType[t].count++;
            if (v.status === "On Trip") byType[t].active++;
          });
          const entries = Object.entries(byType);
          if (!entries.length) return <p style={{ color: "var(--color-muted)" }}>No data.</p>;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {entries.map(([type, { count, active }]) => {
                const pct = count > 0 ? (active / count) * 100 : 0;
                const barColor = pct > 70 ? CHART.green : pct > 30 ? CHART.amber : CHART.red;
                return (
                  <div key={type}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>{type}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>{active}/{count} — <span style={{ color: barColor, fontWeight: 700 }}>{pct.toFixed(0)}%</span></span>
                    </div>
                    <div style={{ height: "6px", background: "var(--color-surface-2)", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "99px", transition: "width 0.7s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </Card>

      <Card style={{ width: "100%", padding: "var(--space-4)", boxSizing: "border-box" }}>
        <SectionTitle>Trip Ledger</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <Th>Trip</Th><Th>Vehicle</Th><Th>Driver</Th><Th>Distance</Th><Th>Fuel (L)</Th><Th>Route</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {tripList.slice(0, 12).map((trip) => {
                const v = vehicleList.find((x) => x.id === trip.vehicle_id);
                const d = (drivers ?? []).find((x: Driver) => x.id === trip.driver_id);
                return (
                  <tr key={trip.id}>
                    <Td><span style={{ fontWeight: 700, fontFamily: "monospace" }}>TR{String(trip.id).padStart(3,"0")}</span></Td>
                    <Td>{v?.registration_number ?? `#${trip.vehicle_id}`}</Td>
                    <Td>{d?.name ?? `#${trip.driver_id}`}</Td>
                    <Td style={{ color: "var(--color-muted)" }}>{trip.planned_distance ? `${trip.planned_distance} km` : "—"}</Td>
                    <Td style={{ color: "var(--color-muted)" }}>{trip.fuel_consumed ? `${trip.fuel_consumed.toFixed(1)}` : "—"}</Td>
                    <Td style={{ color: "var(--color-muted)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trip.source} → {trip.destination}</Td>
                    <Td><StatusBadge status={trip.status} /></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ═══════ MAIN PAGE ════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const workspace = roleWorkspace(user);
  const [typeFilter,   setTypeFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");

  const { data: kpis,     loading: kpiL     } = useAsync<DashboardKpis>(() => apiGet(endpoints.kpis), []);
  const { data: trips,    loading: tripsL   } = useAsync<Trip[]>(() => apiGetItems<Trip>(endpoints.trips, { limit: 100 }), []);
  const { data: vehicles, loading: vehiclesL} = useAsync<Vehicle[]>(() => apiGetItems<Vehicle>(endpoints.vehicles), []);
  const { data: drivers,  loading: driversL } = useAsync<Driver[]>(() => apiGetItems<Driver>(endpoints.drivers), []);

  const loading = kpiL || tripsL || vehiclesL || driversL;

  const regionOptions = useMemo(() =>
    Array.from(new Set((vehicles ?? []).map((v) => v.region).filter((r): r is string => Boolean(r)))).sort()
  , [vehicles]);

  const typeOptions = useMemo(() =>
    Array.from(new Set((vehicles ?? []).map((v) => v.vehicle_type).filter(Boolean))).sort()
  , [vehicles]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px", flexDirection: "column", gap: "16px" }}>
        <Spinner />
        <span style={{ fontSize: "0.82rem", color: "var(--color-muted)" }}>Loading dashboard…</span>
      </div>
    );
  }

  const role = user?.role ?? "fleet_manager";

  const ROLE_LABEL: Record<string, string> = {
    fleet_manager: "Fleet Manager", driver: "Driver",
    safety_officer: "Safety Officer", financial_analyst: "Financial Analyst",
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            {workspace.dashboardTitle}
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: "0.875rem", color: "var(--color-muted)" }}>
            {workspace.dashboardSub}
          </p>
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "7px",
          padding: "5px 14px", borderRadius: "99px",
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "0.08em", color: "var(--color-muted)",
          textTransform: "uppercase",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-faint)" }} />
          {ROLE_LABEL[role] ?? role}
        </span>
      </div>

      {role === "fleet_manager"    && <FleetManagerDashboard kpis={kpis} trips={trips} vehicles={vehicles} drivers={drivers} typeFilter={typeFilter} setTypeFilter={setTypeFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} regionFilter={regionFilter} setRegionFilter={setRegionFilter} regionOptions={regionOptions} typeOptions={typeOptions} />}
      {role === "driver"           && <DriverDashboard trips={trips} vehicles={vehicles} drivers={drivers} user={user} />}
      {role === "safety_officer"   && <SafetyDashboard drivers={drivers} trips={trips} />}
      {role === "financial_analyst"&& <FinanceDashboard kpis={kpis} trips={trips} vehicles={vehicles} drivers={drivers} />}
    </>
  );
}
