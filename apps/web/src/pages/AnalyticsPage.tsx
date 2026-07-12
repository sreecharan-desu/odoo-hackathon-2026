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
            <h3 style={{ margin: "0 0 var(--space-3)" }}>
              {isFinance ? "Cost Distribution by Vehicle" : "Operating Cost Distribution"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "var(--space-2)" }}>
              {fleetCosts.map((v) => {
                const pct = (v.total_operational_cost / maxCost) * 100;
                return (
                  <div
                    key={v.vehicle_id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr 100px",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {v.registration_number}
                    </span>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "4px",
                        height: "20px",
                        overflow: "hidden",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          background: "var(--color-primary)",
                          width: `${Math.max(pct, 2)}%`,
                          height: "100%",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <span style={{ textAlign: "right", fontSize: "0.875rem", fontWeight: "bold" }}>
                      {formatInr(v.total_operational_cost, 2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 var(--space-3)" }}>Efficiency, Cost & ROI</h3>
            <p className="text-muted" style={{ marginTop: 0, marginBottom: "var(--space-3)", fontSize: "0.85rem" }}>
              ROI = (Estimated revenue − Maintenance − Fuel) ÷ Acquisition cost. Revenue ≈ completed trip km × ₹40.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
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
                    <tr key={v.vehicle_id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
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
