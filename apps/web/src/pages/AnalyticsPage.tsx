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
  targetAvg?: number;
}

function ColumnChart({ data, ySuffix = "", isPercentage = false, targetAvg }: ColumnChartProps) {
  const width = 800;
  const height = 250;
  const paddingX = 50;
  const paddingY = 30;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values.map(v => Math.abs(v)), 1);
  const minVal = Math.min(...values, 0);

  const range = maxVal - minVal;
  const chartHeight = height - 2 * paddingY;
  const yZero = height - paddingY - ((0 - minVal) / range) * chartHeight;

  // Generate grid lines
  const gridLines = [0.25, 0.5, 0.75, 1].flatMap(pct => {
    const lines = [];
    if (maxVal > 0) {
      const val = pct * maxVal;
      const y = height - paddingY - ((val - minVal) / range) * chartHeight;
      lines.push({ y, label: isPercentage ? `${val.toFixed(0)}%` : `${val.toFixed(0)}${ySuffix}` });
    }
    if (minVal < 0) {
      const val = pct * minVal;
      const y = height - paddingY - ((val - minVal) / range) * chartHeight;
      lines.push({ y, label: isPercentage ? `${val.toFixed(0)}%` : `${val.toFixed(0)}${ySuffix}` });
    }
    return lines;
  });

  // Calculate coordinates for average line if targetAvg is provided
  const avgY = targetAvg !== undefined && targetAvg > 0
    ? height - paddingY - ((targetAvg - minVal) / range) * chartHeight
    : null;

  return (
    <div style={{ width: "100%", overflowX: "auto", marginBottom: "24px" }}>
      <div style={{ minWidth: "700px", position: "relative" }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          <defs>
            <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((g, idx) => (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={g.y}
                x2={width - paddingX}
                y2={g.y}
                stroke="var(--color-border)"
                strokeDasharray="4 4"
                strokeOpacity="0.5"
              />
              <text
                x={paddingX - 10}
                y={g.y + 4}
                fill="var(--color-muted)"
                fontSize="9"
                fontWeight="600"
                textAnchor="end"
              >
                {g.label}
              </text>
            </g>
          ))}

          {/* Zero baseline */}
          <line
            x1={paddingX}
            y1={yZero}
            x2={width - paddingX}
            y2={yZero}
            stroke="var(--color-muted-2, #64748b)"
            strokeWidth="1.5"
          />

          {/* Target Average Line */}
          {avgY !== null && targetAvg !== undefined && avgY >= paddingY && avgY <= height - paddingY && (
            <g>
              <line
                x1={paddingX}
                y1={avgY}
                x2={width - paddingX}
                y2={avgY}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <text
                x={width - paddingX - 10}
                y={avgY - 6}
                fill="#f59e0b"
                fontSize="9.5"
                fontWeight="800"
                textAnchor="end"
              >
                Fleet Average: {targetAvg.toFixed(1)}{ySuffix}
              </text>
            </g>
          )}

          {data.map((d, i) => {
            const colWidth = (width - 2 * paddingX) / Math.max(data.length, 1);
            const x = paddingX + i * colWidth + colWidth * 0.15;
            const barW = colWidth * 0.7;

            const pct = d.value / range;
            const barH = Math.abs(pct * chartHeight);
            const y = d.value >= 0 ? yZero - barH : yZero;

            const isPositive = d.value >= 0;
            // Use blue gradient for efficiency, pos/neg for ROI
            const barFill = ySuffix.includes("km/L")
              ? "url(#blueGrad)"
              : isPositive
                ? "url(#posGrad)"
                : "url(#negGrad)";

            return (
              <g key={i}>
                {/* Column block */}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(barH, 2)}
                  fill={barFill}
                  rx="4"
                  style={{ transition: "all 0.3s" }}
                />
                
                {/* Value label */}
                <text
                  x={x + barW / 2}
                  y={isPositive ? y - 6 : y + barH + 12}
                  fill="var(--color-text)"
                  fontSize="9.5"
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
                  fontWeight="700"
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
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px", fontSize: "0.75rem", color: "var(--color-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "linear-gradient(to right, #3b82f6, #60a5fa)" }} />
                <span>Fuel Cost</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "linear-gradient(to right, #f59e0b, #fbbf24)" }} />
                <span>Maintenance</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "linear-gradient(to right, #a855f7, #c084fc)" }} />
                <span>Other Expenses</span>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "var(--space-2)" }}>
              {fleetCosts.map((v) => {
                const totalCost = v.total_operational_cost || 1;
                const fuelRatio = v.fuel_cost / totalCost;
                const maintRatio = v.maintenance_cost / totalCost;
                const otherRatio = v.other_expenses / totalCost;

                const overallWidthPct = (totalCost / maxCost) * 100;
                const fuelPct = fuelRatio * overallWidthPct;
                const maintPct = maintRatio * overallWidthPct;
                const otherPct = otherRatio * overallWidthPct;

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
                        <div style={{ width: `${fuelPct}%`, background: "linear-gradient(to right, #3b82f6, #60a5fa)", height: "100%" }} title={`Fuel: ${formatInr(v.fuel_cost, 2)}`} />
                      )}
                      {v.maintenance_cost > 0 && (
                        <div style={{ width: `${maintPct}%`, background: "linear-gradient(to right, #f59e0b, #fbbf24)", height: "100%" }} title={`Maintenance: ${formatInr(v.maintenance_cost, 2)}`} />
                      )}
                      {v.other_expenses > 0 && (
                        <div style={{ width: `${otherPct}%`, background: "linear-gradient(to right, #a855f7, #c084fc)", height: "100%" }} title={`Other Expenses: ${formatInr(v.other_expenses, 2)}`} />
                      )}
                    </div>
                    
                    <div style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "0.68rem",
                      color: "var(--color-muted-2)",
                      fontWeight: 600,
                      marginTop: "2px"
                    }}>
                      {v.fuel_cost > 0 && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#3b82f6" }} />
                          Fuel: {formatInr(v.fuel_cost)} ({((v.fuel_cost / totalCost) * 100).toFixed(0)}%)
                        </span>
                      )}
                      {v.maintenance_cost > 0 && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f59e0b" }} />
                          Maint: {formatInr(v.maintenance_cost)} ({((v.maintenance_cost / totalCost) * 100).toFixed(0)}%)
                        </span>
                      )}
                      {v.other_expenses > 0 && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#a855f7" }} />
                          Other: {formatInr(v.other_expenses)} ({((v.other_expenses / totalCost) * 100).toFixed(0)}%)
                        </span>
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
            <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "1px solid var(--color-border)" }}>
              <button
                onClick={() => setActiveTab("roi")}
                style={{
                  padding: "10px 4px",
                  background: "transparent",
                  color: activeTab === "roi" ? "var(--color-accent)" : "var(--color-muted)",
                  border: "none",
                  borderBottom: activeTab === "roi" ? "2.5px solid var(--color-accent)" : "2.5px solid transparent",
                  fontWeight: 700,
                  fontSize: "0.86rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                ROI Performance (%)
              </button>
              <button
                onClick={() => setActiveTab("efficiency")}
                style={{
                  padding: "10px 4px",
                  background: "transparent",
                  color: activeTab === "efficiency" ? "var(--color-accent)" : "var(--color-muted)",
                  border: "none",
                  borderBottom: activeTab === "efficiency" ? "2.5px solid var(--color-accent)" : "2.5px solid transparent",
                  fontWeight: 700,
                  fontSize: "0.86rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Fuel Efficiency (km/L)
              </button>
            </div>

            {/* Display column chart */}
            {activeTab === "roi" ? (
              <ColumnChart data={roiData} isPercentage={true} />
            ) : (
              <ColumnChart data={efficiencyData} ySuffix=" km/L" targetAvg={avgEfficiency} />
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
