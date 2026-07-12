import { useState, useEffect } from "react";
import { Card, Spinner, Button, Pagination } from "../components/ui";
import { TextField, NumberField, SelectField } from "../components/forms";
import * as validators from "../lib/validators";
import { useApiList } from "../hooks/useApiList";
import { useAuth } from "../hooks/useAuth";
import { endpoints, apiPost, apiGetItems } from "../lib/api";
import { canManageMaintenance } from "../lib/rbac";
import { formatInr } from "../constants";
import type { MaintenanceLog, Vehicle } from "../types";

const PAGE_SIZE = 25;

export default function MaintenancePage() {
  const { user } = useAuth();
  const allowManage = canManageMaintenance(user);
  const [offset, setOffset] = useState(0);
  const { data: logs, total, error, loading, apiMissing, refetch: refetchLogs } = useApiList<MaintenanceLog>(
    endpoints.maintenance,
    { limit: PAGE_SIZE, offset },
  );
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  // Input validation states
  const [vehicleIdError, setVehicleIdError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [estimatedCostError, setEstimatedCostError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdding) {
      setLoadingVehicles(true);
      void apiGetItems<Vehicle>(endpoints.vehicles)
        .then((res) => setVehicles(res))
        .catch((err) => console.error(err))
        .finally(() => setLoadingVehicles(false));
    }
  }, [isAdding]);

  const handleOpenMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate inputs
    const vehErr = validators.required(vehicleId, "Vehicle Selection");
    const titleErr = validators.required(title, "Maintenance Title");
    const costErr = validators.positiveNumber(estimatedCost, "Estimated Cost");

    setVehicleIdError(vehErr);
    setTitleError(titleErr);
    setEstimatedCostError(costErr);

    if (vehErr || titleErr || costErr) {
      return;
    }

    setSubmitting(true);
    try {
      await apiPost(endpoints.maintenance, {
        vehicle_id: parseInt(vehicleId),
        title,
        description: description || null,
        estimated_cost: parseFloat(estimatedCost || "0")
      });
      setIsAdding(false);
      // Reset form
      setVehicleId("");
      setTitle("");
      setDescription("");
      setEstimatedCost("");
      void refetchLogs();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to open maintenance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseMaintenance = async (logId: number) => {
    try {
      await apiPost(`/api/maintenance/${logId}/close`, {});
      void refetchLogs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to close maintenance");
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Maintenance Orders</h2>
          <p className="text-muted">Open and track vehicle maintenance, scheduling, and shop logs</p>
        </div>
        {allowManage && <Button onClick={() => setIsAdding(true)}>Open Maintenance</Button>}
      </div>

      <Card>
        {loading && <Spinner />}
        {apiMissing && (
          <p className="page-empty">Maintenance API not available yet. Work orders will appear here.</p>
        )}
        {error && <p className="error">{error}</p>}
        {logs && logs.length === 0 && (
          <p className="page-empty">No maintenance records yet.</p>
        )}
        {logs && logs.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>ID</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Vehicle ID</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Issue / Title</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Description</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Est. Cost</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Opened At</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Closed At</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Status</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>#{log.id}</td>
                    <td style={{ padding: "var(--space-2)" }}>Vehicle #{log.vehicle_id}</td>
                    <td style={{ padding: "var(--space-2)" }}>{log.title}</td>
                    <td style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>{log.description ?? "—"}</td>
                    <td style={{ padding: "var(--space-2)" }}>{formatInr(log.estimated_cost)}</td>
                    <td style={{ padding: "var(--space-2)", fontSize: "0.85rem" }}>{log.opened_at ? new Date(log.opened_at).toLocaleString() : "—"}</td>
                    <td style={{ padding: "var(--space-2)", fontSize: "0.85rem" }}>{log.closed_at ? new Date(log.closed_at).toLocaleString() : "—"}</td>
                    <td style={{ padding: "var(--space-2)" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: log.status === "Closed" ? "rgba(40, 167, 69, 0.15)" : "rgba(255, 193, 7, 0.15)",
                        color: log.status === "Closed" ? "#28a745" : "#ffc107"
                      }}>
                        {log.status === "Open" ? "In Shop" : log.status}
                      </span>
                    </td>
                    <td style={{ padding: "var(--space-2)" }}>
                      {log.status === "Open" && allowManage && (
                        <Button style={{ background: "#28a745", padding: "4px 8px", fontSize: "0.85rem" }} onClick={() => void handleCloseMaintenance(log.id)}>Close Order</Button>
                      )}
                      {log.status === "Closed" && (
                        <span style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {logs && (
          <Pagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
        )}
      </Card>

      {/* Open Maintenance Modal */}
      {isAdding && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "var(--space-4)"
        }}>
          <Card style={{ width: "100%", maxWidth: "500px" }}>
            <h3 style={{ margin: "0 0 var(--space-3)" }}>Open Maintenance Log</h3>
            {loadingVehicles ? (
              <Spinner />
            ) : (
              <form onSubmit={(e) => void handleOpenMaintenance(e)}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                  <SelectField
                    id="maintVehicle"
                    label="Select Vehicle *"
                    required
                    options={vehicles.map(v => ({
                      value: String(v.id),
                      label: `${v.registration_number} - ${v.name} (${v.status})`
                    }))}
                    placeholder="-- Select Vehicle --"
                    value={vehicleId}
                    error={vehicleIdError}
                    onChange={(e) => {
                      setVehicleId(e.target.value);
                      if (vehicleIdError) setVehicleIdError(null);
                    }}
                  />
                  <TextField
                    id="maintTitle"
                    label="Maintenance Title *"
                    required
                    placeholder="e.g. 50k miles Oil Change"
                    value={title}
                    error={titleError}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError) setTitleError(null);
                    }}
                  />
                  <div className="form-field">
                    <label htmlFor="maintDesc" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Detailed Description</label>
                    <textarea
                      id="maintDesc"
                      rows={3}
                      placeholder="Specify issue detail, components, or labor details"
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)", fontFamily: "inherit" }}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <NumberField
                    id="maintCost"
                    label="Estimated Cost (₹) *"
                    required
                    min={0}
                    value={estimatedCost}
                    error={estimatedCostError}
                    onChange={(e) => {
                      setEstimatedCost(e.target.value);
                      if (estimatedCostError) setEstimatedCostError(null);
                    }}
                  />
                </div>
                {formError && <p className="error" style={{ marginBottom: "var(--space-3)" }}>{formError}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? "Opening..." : "Open Log (In Shop)"}</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
