import { useMemo, useState } from "react";
import { Card, Spinner } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import { roleWorkspace } from "../lib/rbac";
import { apiGet, apiGetItems, endpoints } from "../lib/api";
import type { DashboardKpis, Trip, Vehicle, Driver } from "../types";
import "../components/layout/shell.css";

/* ─── design tokens ─── */
const C = {
  green:  "#22c55e",
  amber:  "#f59e0b",
  red:    "#ef4444",
  blue:   "#3b82f6",
  purple: "#a855f7",
  muted:  "var(--color-muted)",
  border: "var(--color-border)",
  card:   "var(--color-surface-2)",
};

const fmtDate = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";

/* ─── status badge ─── */
const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  Completed:  { bg: "rgba(34,197,94,0.12)",  text: "#22c55e", dot: "#22c55e" },
  Dispatched: { bg: "rgba(59,130,246,0.12)", text: "#3b82f6", dot: "#3b82f6" },
  Cancelled:  { bg: "rgba(239,68,68,0.10)",  text: "#ef4444", dot: "#ef4444" },
  Draft:      { bg: "var(--color-surface-2)", text: "var(--color-muted)", dot: "var(--color-muted-2)" },
  Active:     { bg: "rgba(34,197,94,0.12)",  text: "#22c55e", dot: "#22c55e" },
  Inactive:   { bg: "rgba(239,68,68,0.10)",  text: "#ef4444", dot: "#ef4444" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLOR[status] ?? STATUS_COLOR.Draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "0.72rem", fontWeight: 700,
      background: s.bg, color: s.text,
    }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

/* ─── KPI card ─── */
interface KpiProps { label: string; value: string | number; sub?: string; accent?: string }
function KpiCard({ label, value, sub, accent }: KpiProps) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: "12px",
      padding: "20px 18px",
      display: "flex", flexDirection: "column", gap: "8px",
      minWidth: 0,
      position: "relative",
      overflow: "hidden",
    }}>
      {accent && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "2px", background: accent, borderRadius: "12px 12px 0 0",
        }} />
      )}
      <span style={{
        fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em",
        color: C.muted, textTransform: "uppercase",
      }}>
        {label}
      </span>
      <span style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: "0.74rem", color: C.muted }}>{sub}</span>}
    </div>
  );
}

/* ─── Donut chart ─── */
interface DonutSeg { label: string; count: number; color: string }
function DonutChart({ segments, total }: { segments: DonutSeg[]; total: number }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "space-around",
      gap: "36px", padding: "8px 0",
    }}>
      {/* SVG Donut */}
      <div style={{ position: "relative", width: "220px", height: "220px", flexShrink: 0 }}>
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <circle cx="100" cy="100" r={r} fill="transparent"
            stroke="var(--color-border)" strokeWidth="24" />
          {segments.map((seg) => {
            const pct = total > 0 ? seg.count / total : 0;
            const dash = `${pct * circ} ${circ}`;
            const offset = -acc;
            acc += pct * circ;
            if (seg.count === 0) return null;
            return (
              <circle key={seg.label}
                cx="100" cy="100" r={r}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="24"
                strokeDasharray={dash}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                transform="rotate(-90 100 100)"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            );
          })}
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text)" }}>{total}</span>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", color: C.muted, marginTop: "2px" }}>
            VEHICLES
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ flex: 1, minWidth: "220px", maxWidth: "340px" }}>
        {segments.map((seg) => {
          const pct = total > 0 ? ((seg.count / total) * 100).toFixed(0) : "0";
          return (
            <div key={seg.label} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 0",
              borderBottom: `1px solid ${C.border}`,
            }}>
              <span style={{
                width: "10px", height: "10px", borderRadius: "3px",
                background: seg.color, flexShrink: 0,
              }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text)", flex: 1 }}>
                {seg.label}
              </span>
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text)" }}>{seg.count}</span>
              <span style={{
                fontSize: "0.75rem", color: C.muted, minWidth: "36px", textAlign: "right",
              }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Section header ─── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      marginBottom: "20px",
      paddingBottom: "12px",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <h3 style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>
        {children}
      </h3>
    </div>
  );
}

/* ─── Table header cell ─── */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: "10px 10px 10px 0",
      color: C.muted, fontWeight: 600,
      fontSize: "0.68rem", letterSpacing: "0.09em",
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{children}</th>
  );
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: "13px 10px 13px 0", fontSize: "0.875rem", ...style }}>
      {children}
    </td>
  );
}

/* ─── Trips table ─── */
function TripsTable({ trips, vehicles, drivers }: { trips: Trip[]; vehicles: Vehicle[]; drivers: Driver[] }) {
  if (trips.length === 0) return <p style={{ color: C.muted, textAlign: "center", padding: "32px 0", fontSize: "0.875rem" }}>No trips found.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
            <Th>Trip</Th><Th>Vehicle</Th><Th>Driver</Th>
            <Th>Route</Th><Th>Status</Th><Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {trips.slice(0, 7).map((trip) => {
            const v = vehicles.find((x) => x.id === trip.vehicle_id);
            const d = drivers.find((x) => x.id === trip.driver_id);
            return (
              <tr key={trip.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <Td><span style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--color-text)" }}>TR{String(trip.id).padStart(3, "0")}</span></Td>
                <Td><span style={{ color: "var(--color-text)" }}>{v?.registration_number ?? `#${trip.vehicle_id}`}</span></Td>
                <Td><span style={{ color: "var(--color-text)" }}>{d?.name ?? `#${trip.driver_id}`}</span></Td>
                <Td style={{ color: C.muted, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {trip.source} → {trip.destination}
                </Td>
                <Td><StatusBadge status={trip.status} /></Td>
                <Td style={{ color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(trip.created_at)}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════
   ROLE VIEWS
═══════════════════════════════════════ */

function FleetManagerDashboard({ kpis, trips, vehicles, drivers, typeFilter, setTypeFilter, statusFilter, setStatusFilter, regionFilter, setRegionFilter, regionOptions, typeOptions }: any) {
  const vehicleList: Vehicle[] = vehicles ?? [];
  const tripList: Trip[] = trips ?? [];
  const driverList: Driver[] = drivers ?? [];

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
    { label: "Available", count: counts.Available, color: C.green },
    { label: "On Trip",   count: counts.OnTrip,    color: C.blue  },
    { label: "In Shop",   count: counts.InShop,    color: C.amber },
    { label: "Retired",   count: counts.Retired,   color: C.red   },
  ];

  return (
    <>
      {kpis && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <KpiCard label="Active Vehicles"    value={kpis.active_vehicles}               accent={C.green}  />
          <KpiCard label="Available"          value={kpis.available_vehicles}            accent={C.green}  />
          <KpiCard label="In Maintenance"     value={kpis.vehicles_in_shop}              accent={C.amber}  />
          <KpiCard label="Active Trips"       value={kpis.active_trips}                  accent={C.blue}   />
          <KpiCard label="Pending Trips"      value={kpis.pending_trips}                 accent={C.purple} />
          <KpiCard label="Drivers on Duty"    value={kpis.drivers_on_duty}               accent={C.blue}   />
          <KpiCard label="Fleet Utilization"  value={`${kpis.fleet_utilization_pct?.toFixed(0) ?? 0}%`} accent={C.amber} />
        </div>
      )}

      {/* Donut chart */}
      <Card style={{ width: "100%", padding: "var(--space-4)", marginBottom: "20px", boxSizing: "border-box" }}>
        <SectionTitle>Vehicle Status Breakdown</SectionTitle>
        <DonutChart segments={segs} total={total} />
      </Card>

      {/* Filters — above trips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase" }}>Filters</span>
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
        <KpiCard label="Active Trips"   value={active}          sub="Currently dispatched"  accent={C.blue}  />
        <KpiCard label="Completed"      value={completed}       sub="All time"               accent={C.green} />
        <KpiCard label="Pending"        value={pending}         sub="Awaiting dispatch"      accent={C.amber} />
        <KpiCard label="Total Assigned" value={tripList.length} sub="Across all time"       />
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

  const expired     = driverList.filter((d) => d.license_expiry && new Date(d.license_expiry) < now).length;
  const expiringSoon = driverList.filter((d) => {
    if (!d.license_expiry) return false;
    const diff = (new Date(d.license_expiry).getTime() - now.getTime()) / 86400000;
    return diff >= 0 && diff <= 90;
  }).length;
  const active  = driverList.filter((d) => d.status === "Active").length;
  const onDuty  = tripList.filter((t) => t.status === "Dispatched").length;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <KpiCard label="Total Drivers"     value={driverList.length}                         />
        <KpiCard label="Active"            value={active}            sub="Available for duty" accent={C.green}  />
        <KpiCard label="On Duty"           value={onDuty}            sub="Dispatched now"     accent={C.blue}   />
        <KpiCard label="Expired Licenses"  value={expired}           sub="Needs renewal"      accent={C.red}    />
        <KpiCard label="Expiring (90 days)" value={expiringSoon}     sub="Action required"    accent={C.amber}  />
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
                const expiryColor = isExpired ? C.red : C.green;
                return (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <Td><span style={{ fontWeight: 600, color: "var(--color-text)" }}>{d.name}</span></Td>
                    <Td><span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--color-text)" }}>{d.license_number ?? "—"}</span></Td>
                    <Td style={{ color: "var(--color-text)" }}>{d.license_category ?? "—"}</Td>
                    <Td>
                      <span style={{ color: expiryColor, fontWeight: 600, fontSize: "0.82rem" }}>
                        {fmtDate(d.license_expiry)}{isExpired ? " ⚠" : ""}
                      </span>
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
  const tripList: Trip[]     = trips ?? [];
  const vehicleList: Vehicle[] = vehicles ?? [];

  const totalFuelConsumed = tripList.reduce((acc, t) => acc + (t.fuel_consumed ?? 0), 0);
  const totalDistance     = tripList.reduce((acc, t) => acc + (t.planned_distance ?? 0), 0);
  const completedTrips    = tripList.filter((t) => t.status === "Completed").length;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <KpiCard label="Fleet Utilization"  value={`${kpis?.fleet_utilization_pct?.toFixed(0) ?? 0}%`} sub="Active / Total fleet"     accent={C.blue}  />
        <KpiCard label="Active Vehicles"    value={kpis?.active_vehicles ?? "—"}                        sub="In operation"             accent={C.green} />
        <KpiCard label="Fuel Consumed"      value={totalFuelConsumed > 0 ? `${totalFuelConsumed.toFixed(0)}L` : "—"} sub="All trips" accent={C.amber} />
        <KpiCard label="Total Distance"     value={totalDistance > 0 ? `${totalDistance.toFixed(0)} km` : "—"} sub="Planned"          accent={C.purple}/>
        <KpiCard label="Completed Trips"    value={completedTrips}                                      sub="Successfully finished"    accent={C.green} />
      </div>

      {/* Utilization bars */}
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
          if (!entries.length) return <p style={{ color: C.muted, fontSize: "0.875rem" }}>No data.</p>;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {entries.map(([type, { count, active }]) => {
                const pct = count > 0 ? (active / count) * 100 : 0;
                const barColor = pct > 70 ? C.green : pct > 30 ? C.amber : C.red;
                return (
                  <div key={type}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>{type}</span>
                      <span style={{ fontSize: "0.8rem", color: C.muted }}>{active}/{count} active — <span style={{ color: barColor, fontWeight: 700 }}>{pct.toFixed(0)}%</span></span>
                    </div>
                    <div style={{ height: "6px", background: "var(--color-border)", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: "99px", transition: "width 0.7s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </Card>

      {/* Trip ledger */}
      <Card style={{ width: "100%", padding: "var(--space-4)", boxSizing: "border-box" }}>
        <SectionTitle>Trip Ledger</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <Th>Trip</Th><Th>Vehicle</Th><Th>Driver</Th>
                <Th>Distance</Th><Th>Fuel (L)</Th><Th>Route</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {tripList.slice(0, 7).map((trip) => {
                const v = vehicleList.find((x) => x.id === trip.vehicle_id);
                const d = (drivers ?? []).find((x: Driver) => x.id === trip.driver_id);
                return (
                  <tr key={trip.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <Td><span style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--color-text)" }}>TR{String(trip.id).padStart(3,"0")}</span></Td>
                    <Td style={{ color: "var(--color-text)" }}>{v?.registration_number ?? `#${trip.vehicle_id}`}</Td>
                    <Td style={{ color: "var(--color-text)" }}>{d?.name ?? `#${trip.driver_id}`}</Td>
                    <Td style={{ color: C.muted }}>{trip.planned_distance ? `${trip.planned_distance} km` : "—"}</Td>
                    <Td style={{ color: C.muted }}>{trip.fuel_consumed ? `${trip.fuel_consumed.toFixed(1)}` : "—"}</Td>
                    <Td style={{ color: C.muted, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trip.source} → {trip.destination}</Td>
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

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const workspace = roleWorkspace(user);
  const [typeFilter,   setTypeFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");

  const { data: kpis,    loading: kpiL    } = useAsync<DashboardKpis>(() => apiGet(endpoints.kpis), []);
  const { data: trips,   loading: tripsL  } = useAsync<Trip[]>(() => apiGetItems<Trip>(endpoints.trips, { limit: 100 }), []);
  const { data: vehicles,loading: vehiclesL} = useAsync<Vehicle[]>(() => apiGetItems<Vehicle>(endpoints.vehicles), []);
  const { data: drivers, loading: driversL } = useAsync<Driver[]>(() => apiGetItems<Driver>(endpoints.drivers), []);

  const loading = kpiL || tripsL || vehiclesL || driversL;

  const regionOptions = useMemo(() =>
    Array.from(new Set((vehicles ?? []).map((v) => v.region).filter((r): r is string => Boolean(r)))).sort()
  , [vehicles]);

  const typeOptions = useMemo(() =>
    Array.from(new Set((vehicles ?? []).map((v) => v.vehicle_type).filter(Boolean))).sort()
  , [vehicles]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "100px 0", flexDirection: "column", gap: "16px" }}>
        <Spinner />
        <span style={{ fontSize: "0.82rem", color: C.muted }}>Loading dashboard…</span>
      </div>
    );
  }

  const role = user?.role ?? "fleet_manager";

  const ROLE_BADGE: Record<string, { label: string; color: string }> = {
    fleet_manager:    { label: "Fleet Manager",     color: C.blue   },
    driver:           { label: "Driver",             color: C.green  },
    safety_officer:   { label: "Safety Officer",     color: C.amber  },
    financial_analyst:{ label: "Financial Analyst",  color: C.purple },
  };
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.fleet_manager;

  return (
    <>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            {workspace.dashboardTitle}
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: "0.875rem", color: C.muted }}>
            {workspace.dashboardSub}
          </p>
        </div>
        {/* Role pill */}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "7px",
          padding: "5px 14px", borderRadius: "99px",
          background: `${badge.color}18`,
          border: `1px solid ${badge.color}40`,
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "0.08em", color: badge.color,
          textTransform: "uppercase",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: badge.color }} />
          {badge.label}
        </span>
      </div>

      {role === "fleet_manager" && (
        <FleetManagerDashboard
          kpis={kpis} trips={trips} vehicles={vehicles} drivers={drivers}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          regionFilter={regionFilter} setRegionFilter={setRegionFilter}
          regionOptions={regionOptions} typeOptions={typeOptions}
        />
      )}
      {role === "driver" && (
        <DriverDashboard trips={trips} vehicles={vehicles} drivers={drivers} user={user} />
      )}
      {role === "safety_officer" && (
        <SafetyDashboard drivers={drivers} trips={trips} />
      )}
      {role === "financial_analyst" && (
        <FinanceDashboard kpis={kpis} trips={trips} vehicles={vehicles} drivers={drivers} />
      )}
    </>
  );
}
