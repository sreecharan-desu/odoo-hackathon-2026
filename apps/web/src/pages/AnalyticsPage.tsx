import { useState, useMemo } from "react";
import { API_BASE_URL, formatInr } from "../constants";
import { Card, Spinner, Button } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { useAsync } from "../hooks/useAsync";
import { apiGetItems, endpoints } from "../lib/api";
import { hasRole, pageChrome } from "../lib/rbac";

type VehicleCostRow = {
  vehicle_id: number;
  registration_number: string;
  name: string;
  status: string;
  vehicle_type?: string;
  fuel_cost: number;
  fuel_liters: number;
  distance_km: number;
  fuel_efficiency_km_per_l: number | null;
  maintenance_cost: number;
  other_expenses: number;
  estimated_revenue: number;
  total_operational_cost: number;
  acquisition_cost: number;
  roi: number | null;
};

function fmtRoi(roi: number | null): string {
  if (roi === null || Number.isNaN(roi)) return "—";
  return `${(roi * 100).toFixed(1)}%`;
}

interface ColumnChartProps {
  data: { label: string; value: number }[];
  ySuffix?: string;
  isPercentage?: boolean;
}

function ColumnChart({ data, ySuffix = "", isPercentage = false }: ColumnChartProps) {
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = Math.max(...data.map(d => Math.abs(d.value)), 1);
  const minVal = Math.min(...data.map(d => d.value), 0);

  const range = maxVal - minVal;
  const chartHeight = height - 2 * paddingY;
  const yZero = height - paddingY - ((0 - minVal) / range) * chartHeight;

  return (
    <div style={{ width: "100%", overflowX: "auto", marginBottom: "20px" }}>
      <div style={{ minWidth: "600px", position: "relative" }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          {/* Zero baseline */}
          <line
            x1={paddingX}
            y1={yZero}
            x2={width - paddingX}
            y2={yZero}
            stroke="var(--color-border)"
            strokeWidth="2"
          />

          {data.map((d, i) => {
            const colWidth = (width - 2 * paddingX) / Math.max(data.length, 1);
            const x = paddingX + i * colWidth + colWidth * 0.15;
            const barW = colWidth * 0.7;

            const pct = d.value / range;
            const barH = Math.abs(pct * chartHeight);
            const y = d.value >= 0 ? yZero - barH : yZero;

            const isPositive = d.value >= 0;
            const barColor = isPositive ? "var(--color-positive, #22c55e)" : "var(--color-danger, #ef4444)";

            return (
              <g key={i}>
                {/* Column block */}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(barH, 2)}
                  fill={barColor}
                  rx="4"
                  style={{ transition: "all 0.3s" }}
                />
                {/* Value label */}
                <text
                  x={x + barW / 2}
                  y={isPositive ? y - 6 : y + barH + 12}
                  fill="var(--color-text)"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {isPercentage ? `${d.value.toFixed(1)}%` : `${d.value.toFixed(1)}${ySuffix}`}
                </text>
                {/* Vehicle label */}
                <text
                  x={x + barW / 2}
                  y={isPositive ? yZero + 15 : yZero - 6}
                  fill="var(--color-muted)"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const chrome = pageChrome(user, "analytics");
  const isFinance = hasRole(user, "financial_analyst");

  const { data: fleetCosts, error, loading } = useAsync<VehicleCostRow[]>(
    () => apiGetItems<VehicleCostRow>(endpoints.operationalCosts),
    [],
  );

  const [activeTab, setActiveTab] = useState<"roi" | "efficiency">("roi");

  const roiData = useMemo(() => {
    return (fleetCosts || []).map(v => ({
      label: v.registration_number,
      value: v.roi !== null ? v.roi * 100 : 0,
    }));
  }, [fleetCosts]);

  const efficiencyData = useMemo(() => {
    return (fleetCosts || []).map(v => ({
      label: v.registration_number,
      value: v.fuel_efficiency_km_per_l || 0,
    }));
  }, [fleetCosts]);

  const downloadCsv = async () => {
    try {
      const rawToken = sessionStorage.getItem("transitops_auth");
      const token = rawToken ? JSON.parse(rawToken).token : null;
      const response = await fetch(`${API_BASE_URL}${endpoints.reportsCsv}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("CSV download failed");
      const csvText = await response.text();
      const blob = new Blob([csvText], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `operational_report_${new Date().toISOString().slice(0, 10)}.csv`);
      a.click();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to download CSV");
    }
  };

  const downloadPdf = async () => {
    try {
      const rawToken = sessionStorage.getItem("transitops_auth");
      const token = rawToken ? JSON.parse(rawToken).token : null;
      const response = await fetch(`${API_BASE_URL}${endpoints.reportsPdf}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("PDF download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `operational_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      a.click();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to download PDF");
    }
  };

  const maxCost = fleetCosts ? Math.max(...fleetCosts.map((f) => f.total_operational_cost), 100) : 100;
  const efficiencyValues =
    fleetCosts
      ?.map((v) => v.fuel_efficiency_km_per_l)
      .filter((v): v is number => v !== null && v > 0) ?? [];
  const avgEfficiency = efficiencyValues.length
    ? efficiencyValues.reduce((sum, v) => sum + v, 0) / efficiencyValues.length
    : 0;

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>{chrome.title}</h2>
          <p className="text-muted">{chrome.sub}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={() => void downloadCsv()}>
            {isFinance ? "Export Cost Report" : "Export CSV"}
          </Button>
          <Button variant="ghost" onClick={() => void downloadPdf()}>
            Export PDF
          </Button>
        </div>
      </div>

      {loading && <Spinner />}
      {error && <p className="error">{error}</p>}

      {fleetCosts && fleetCosts.length === 0 && (
        <p className="page-empty">No vehicles logged to analyze operational costs.</p>
      )}

      {fleetCosts && fleetCosts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="page-grid">
            <div className="stat-card">
              <p className="stat-card-label">Avg Fuel Efficiency</p>
              <p className="stat-card-value">{avgEfficiency ? `${avgEfficiency.toFixed(1)} km/L` : "—"}</p>
              <p style={{ margin: "var(--space-1) 0 0", fontSize: "0.75rem", color: "var(--color-muted)" }}>
                Distance ÷ fuel (completed trips)
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Fleet Utilization</p>
              <p className="stat-card-value">
                {(
                  (fleetCosts.filter((v) => v.status === "On Trip").length /
                    Math.max(fleetCosts.filter((v) => v.status !== "Retired").length, 1)) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p style={{ margin: "var(--space-1) 0 0", fontSize: "0.75rem", color: "var(--color-muted)" }}>
                On trip vs active fleet
              </p>
            </div>
          </div>

          <Card>
            <h3 style={{ margin: "0 0 12px" }}>
              {isFinance ? "Cost Distribution by Vehicle" : "Operating Cost Distribution"}
            </h3>
            {/* Legend */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px", fontSize: "0.75rem", color: "var(--color-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#3b82f6" }} />
                <span>Fuel Cost</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#f59e0b" }} />
                <span>Maintenance</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#a855f7" }} />
                <span>Other Expenses</span>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "var(--space-2)" }}>
              {fleetCosts.map((v) => {
                const fuelPct = (v.fuel_cost / maxCost) * 100;
                const maintPct = (v.maintenance_cost / maxCost) * 100;
                const otherPct = (v.other_expenses / maxCost) * 100;

                return (
                  <div key={v.vehicle_id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700 }}>
                      <span>{v.registration_number} <span style={{ fontWeight: 400, color: "var(--color-muted)" }}>({v.name})</span></span>
                      <span>{formatInr(v.total_operational_cost, 2)}</span>
                    </div>
                    <div style={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "99px",
                      height: "12px",
                      display: "flex",
                      overflow: "hidden",
                      width: "100%",
                    }}>
                      {v.fuel_cost > 0 && (
                        <div style={{ width: `${fuelPct}%`, background: "#3b82f6", height: "100%" }} title={`Fuel: ${formatInr(v.fuel_cost, 2)}`} />
                      )}
                      {v.maintenance_cost > 0 && (
                        <div style={{ width: `${maintPct}%`, background: "#f59e0b", height: "100%" }} title={`Maintenance: ${formatInr(v.maintenance_cost, 2)}`} />
                      )}
                      {v.other_expenses > 0 && (
                        <div style={{ width: `${otherPct}%`, background: "#a855f7", height: "100%" }} title={`Other Expenses: ${formatInr(v.other_expenses, 2)}`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 4px" }}>Efficiency, Cost & ROI</h3>
            <p className="text-muted" style={{ marginTop: 0, marginBottom: "16px", fontSize: "0.85rem" }}>
              ROI = (Estimated revenue − Maintenance − Fuel) ÷ Acquisition cost. Revenue ≈ completed trip km × ₹40.
            </p>

            {/* Visual Tabs switcher */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
              <button
                onClick={() => setActiveTab("roi")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  background: activeTab === "roi" ? "var(--color-primary, #3b82f6)" : "transparent",
                  color: activeTab === "roi" ? "var(--btn-primary-text)" : "var(--color-text)",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                ROI Performance (%)
              </button>
              <button
                onClick={() => setActiveTab("efficiency")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  background: activeTab === "efficiency" ? "var(--color-primary, #3b82f6)" : "transparent",
                  color: activeTab === "efficiency" ? "var(--btn-primary-text)" : "var(--color-text)",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Fuel Efficiency (km/L)
              </button>
            </div>

            {/* Display column chart */}
            {activeTab === "roi" ? (
              <ColumnChart data={roiData} isPercentage={true} />
            ) : (
              <ColumnChart data={efficiencyData} ySuffix=" km/L" />
            )}

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Vehicle</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Distance</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Fuel Eff.</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Fuel</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Maint.</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Total Cost</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {fleetCosts.map((v) => (
                    <tr key={v.vehicle_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>
                        {v.registration_number}{" "}
                        <span style={{ fontWeight: "normal", color: "var(--color-muted)", fontSize: "0.85rem" }}>
                          ({v.name})
                        </span>
                      </td>
                      <td style={{ padding: "var(--space-2)" }}>{v.distance_km.toFixed(0)} km</td>
                      <td style={{ padding: "var(--space-2)" }}>
                        {v.fuel_efficiency_km_per_l != null
                          ? `${v.fuel_efficiency_km_per_l.toFixed(1)} km/L`
                          : "—"}
                      </td>
                      <td style={{ padding: "var(--space-2)" }}>{formatInr(v.fuel_cost, 2)}</td>
                      <td style={{ padding: "var(--space-2)" }}>{formatInr(v.maintenance_cost, 2)}</td>
                      <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>
                        {formatInr(v.total_operational_cost, 2)}
                      </td>
                      <td
                        style={{
                          padding: "var(--space-2)",
                          fontWeight: "bold",
                          color:
                            v.roi == null
                              ? "var(--color-muted)"
                              : v.roi >= 0
                                ? "var(--color-success, #28a745)"
                                : "var(--color-error)",
                        }}
                      >
                        {fmtRoi(v.roi)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
