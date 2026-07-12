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
export default function AnalyticsPage() {
  const { user } = useAuth();
  const chrome = pageChrome(user, "analytics");
  const isFinance = hasRole(user, "financial_analyst");

  const { data: fleetCosts, error, loading } = useAsync<VehicleCostRow[]>(
    () => apiGetItems<VehicleCostRow>(endpoints.operationalCosts),
    [],
  );

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
    <div className="analytics-page-container">
      <div className="page-header" style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", flex: 1, minHeight: 0 }}>
          {/* Stat Cards Row */}
          <div className="page-grid" style={{ flexShrink: 0 }}>
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

          {/* Side-by-side Panels */}
          <div className="analytics-split-layout">
            {/* Left Pane: Cost Distribution */}
            <div className="analytics-pane-left">
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
            </div>

            {/* Right Pane: ROI Table */}
            <div className="analytics-pane-right">
              <Card>
                <h3 style={{ margin: "0 0 4px" }}>Efficiency, Cost & ROI</h3>
                <p className="text-muted" style={{ marginTop: 0, marginBottom: "16px", fontSize: "0.85rem" }}>
                  ROI = (Estimated revenue − Maintenance − Fuel) ÷ Acquisition cost. Revenue ≈ completed trip km × ₹40.
                </p>

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
          </div>
        </div>
      )}
    </div>
  );
}
