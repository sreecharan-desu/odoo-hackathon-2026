import { API_BASE_URL } from "../constants";
import { Card, Spinner, Button } from "../components/ui";
import { useAsync } from "../hooks/useAsync";
import { apiGet, apiGetItems } from "../lib/api";
import type { Vehicle } from "../types";

type VehicleWithCosts = Vehicle & {
  costs: {
    fuel_cost: number;
    maintenance_cost: number;
    other_expenses: number;
    total_operational_cost: number;
  };
};

export default function AnalyticsPage() {
  const { data: fleetCosts, error, loading } = useAsync<VehicleWithCosts[]>(async () => {
    const vehicles = await apiGetItems<Vehicle>("/api/vehicles");
    const costPromises = vehicles.map(async (v) => {
      const costs = await apiGet<{
        fuel_cost: number;
        maintenance_cost: number;
        other_expenses: number;
        total_operational_cost: number;
      }>(`/api/vehicles/${v.id}/operational-cost`);
      return {
        ...v,
        costs
      };
    });
    return Promise.all(costPromises);
  }, []);

  const downloadCsv = async () => {
    try {
      const rawToken = sessionStorage.getItem("transitops_auth");
      const token = rawToken ? JSON.parse(rawToken).token : null;
      const response = await fetch(`${API_BASE_URL}/api/reports/operational.csv`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
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

  const maxCost = fleetCosts ? Math.max(...fleetCosts.map(f => f.costs.total_operational_cost), 100) : 100;

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Analytics & Financial Reports</h2>
          <p className="text-muted">Total operational cost split breakdown by fleet assets</p>
        </div>
        <Button onClick={() => void downloadCsv()}>Export CSV</Button>
      </div>

      {loading && <Spinner />}
      {error && <p className="error">{error}</p>}
      
      {fleetCosts && fleetCosts.length === 0 && (
        <p className="page-empty">No vehicles logged to analyze operational costs.</p>
      )}

      {fleetCosts && fleetCosts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Cost Distribution Chart */}
          <Card>
            <h3 style={{ margin: "0 0 var(--space-3)" }}>Operating Cost Distribution</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "var(--space-2)" }}>
              {fleetCosts.map((v) => {
                const pct = (v.costs.total_operational_cost / maxCost) * 100;
                return (
                  <div key={v.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr 100px", alignItems: "center", gap: "var(--space-2)" }}>
                    <span style={{ fontWeight: "bold", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.registration_number}
                    </span>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "4px", height: "20px", overflow: "hidden", width: "100%" }}>
                      <div style={{
                        background: "var(--color-primary)",
                        width: `${Math.max(pct, 2)}%`,
                        height: "100%",
                        borderRadius: "4px",
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                    <span style={{ textAlign: "right", fontSize: "0.875rem", fontWeight: "bold" }}>
                      ${v.costs.total_operational_cost.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Details Table */}
          <Card>
            <h3 style={{ margin: "0 0 var(--space-3)" }}>Operational Costs Breakdown</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Vehicle</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Fuel Cost</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Maintenance</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Other Expenses</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {fleetCosts.map((v) => (
                    <tr key={v.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>
                        {v.registration_number} <span style={{ fontWeight: "normal", color: "var(--color-muted)", fontSize: "0.85rem" }}>({v.name})</span>
                      </td>
                      <td style={{ padding: "var(--space-2)" }}>${v.costs.fuel_cost.toFixed(2)}</td>
                      <td style={{ padding: "var(--space-2)" }}>${v.costs.maintenance_cost.toFixed(2)}</td>
                      <td style={{ padding: "var(--space-2)" }}>${v.costs.other_expenses.toFixed(2)}</td>
                      <td style={{ padding: "var(--space-2)", fontWeight: "bold", color: "var(--color-primary-hover)" }}>
                        ${v.costs.total_operational_cost.toFixed(2)}
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
