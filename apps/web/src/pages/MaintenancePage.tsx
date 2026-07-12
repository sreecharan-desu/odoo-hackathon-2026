import { useState, useEffect, useMemo } from "react";
import { Card, Spinner, Button, Pagination, Skeleton } from "../components/ui";
import { TextField, NumberField, SelectField } from "../components/forms";
import * as validators from "../lib/validators";
import { useApiList } from "../hooks/useApiList";
import { useAuth } from "../hooks/useAuth";
import { endpoints, apiPost, apiGetItems } from "../lib/api";
import { canManageMaintenance, pageChrome } from "../lib/rbac";
import { formatInr } from "../constants";
import type { MaintenanceLog, Vehicle } from "../types";

const PAGE_SIZE = 25;

export default function MaintenancePage() {
  const { user } = useAuth();
  const allowManage = canManageMaintenance(user);
  const chrome = pageChrome(user, "maintenance");
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

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all vehicles on mount to map names/registration numbers in the logs list
  useEffect(() => {
    setLoadingVehicles(true);
    void apiGetItems<Vehicle>(endpoints.vehicles)
      .then((res) => setVehicles(res))
      .catch((err) => console.error(err))
      .finally(() => setLoadingVehicles(false));
  }, []);

  const handleOpenMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

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

  // Compute status summary KPIs
  const stats = useMemo(() => {
    const logList = logs || [];
    const openOrders = logList.filter(l => l.status === "Open");
    const activeCost = openOrders.reduce((sum, l) => sum + l.estimated_cost, 0);
    const uniqueVehicles = new Set(openOrders.map(l => l.vehicle_id)).size;
    const closedCount = logList.filter(l => l.status === "Closed").length;
    
    return {
      activeCount: openOrders.length,
      activeCost,
      inShopVehicles: uniqueVehicles,
      completedCount: closedCount
    };
  }, [logs]);

  // Client-side search and status filter mapping
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(log => {
      const matchStatus = statusFilter === "All" || log.status === statusFilter;
      
      const vehicle = vehicles.find(v => v.id === log.vehicle_id);
      const vehicleStr = vehicle ? `${vehicle.registration_number} ${vehicle.name}` : `Vehicle #${log.vehicle_id}`;
      const searchTarget = `${log.title} ${log.description || ""} ${vehicleStr}`.toLowerCase();
      const matchSearch = searchTarget.includes(searchQuery.toLowerCase());
      
      return matchStatus && matchSearch;
    });
  }, [logs, statusFilter, searchQuery, vehicles]);

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>{chrome.title}</h2>
          <p className="text-muted">{chrome.sub}</p>
        </div>
        {allowManage && <Button onClick={() => setIsAdding(true)}>Open Maintenance</Button>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {/* KPI Summaries */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <Card style={{ padding: "16px" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
              Active Orders
            </span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>
              {stats.activeCount}
            </div>
            <span style={{ fontSize: "0.68rem", color: "var(--color-muted-2)" }}>Currently in shop</span>
          </Card>
          <Card style={{ padding: "16px" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
              Estimated active cost
            </span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>
              {formatInr(stats.activeCost)}
            </div>
            <span style={{ fontSize: "0.68rem", color: "var(--color-muted-2)" }}>Est. maintenance budget</span>
          </Card>
          <Card style={{ padding: "16px" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
              Vehicles in Shop
            </span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>
              {stats.inShopVehicles}
            </div>
            <span style={{ fontSize: "0.68rem", color: "var(--color-muted-2)" }}>Unique assets offline</span>
          </Card>
          <Card style={{ padding: "16px" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
              Completed orders
            </span>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>
              {stats.completedCount}
            </div>
            <span style={{ fontSize: "0.68rem", color: "var(--color-muted-2)" }}>Closed logs this page</span>
          </Card>
        </div>

        {/* Filters and Search Bar */}
        <Card style={{ padding: "16px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-muted)" }}>Status:</span>
            {["All", "Open", "Closed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: statusFilter === st ? "var(--color-accent)" : "var(--color-surface-2)",
                  color: statusFilter === st ? "#000" : "var(--color-text)",
                  transition: "background 0.2s"
                }}
              >
                {st === "All" ? "All Orders" : st === "Open" ? "In Shop" : "Completed"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", maxWidth: "320px" }}>
            <input
              type="text"
              placeholder="Search title, description, or plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                fontSize: "0.82rem",
                outline: "none"
              }}
            />
          </div>
        </Card>

        {/* Main list container */}
        <div>
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {[1, 2, 3, 4].map(i => (
                <Card key={i} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Skeleton width="40%" height={16} />
                    <Skeleton width="20%" height={18} />
                  </div>
                  <Skeleton width="90%" height={14} />
                  <Skeleton width="60%" height={14} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <Skeleton width="30%" height={12} />
                    <Skeleton width="30%" height={12} />
                  </div>
                </Card>
              ))}
            </div>
          )}
          {apiMissing && (
            <p className="page-empty">Maintenance API not available yet. Work orders will appear here.</p>
          )}
          {error && <p className="error">{error}</p>}
          {logs && filteredLogs.length === 0 && (
            <p className="page-empty">No matching work orders found.</p>
          )}
          
          {logs && filteredLogs.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {filteredLogs.map((log) => {
                const vehicle = vehicles.find(v => v.id === log.vehicle_id);
                const vehicleInfo = vehicle ? `${vehicle.registration_number} — ${vehicle.name}` : `Vehicle #${log.vehicle_id}`;
                const isOpen = log.status === "Open";

                return (
                  <Card
                    key={log.id}
                    style={{
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      border: isOpen ? "1px solid rgba(255, 193, 7, 0.25)" : "1px solid var(--color-border)",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
                          Work Order #{log.id}
                        </span>
                        <h4 style={{ margin: "4px 0 2px 0", fontSize: "0.92rem", fontWeight: 700, color: "var(--color-text)" }}>
                          {log.title}
                        </h4>
                      </div>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                        background: isOpen ? "rgba(255, 193, 7, 0.12)" : "rgba(34, 197, 94, 0.12)",
                        color: isOpen ? "#ffc107" : "#22c55e",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        {isOpen && <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ffc107" }} />}
                        {isOpen ? "In Shop" : "Completed"}
                      </span>
                    </div>

                    <div style={{
                      fontSize: "0.8rem",
                      color: "var(--color-muted-2)",
                      background: "var(--color-surface-2)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      minHeight: "48px",
                      lineHeight: "1.4"
                    }}>
                      {log.description || "No description provided."}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "8px", fontSize: "0.78rem" }}>
                      <div>
                        <span style={{ color: "var(--color-muted)", display: "block", fontSize: "0.65rem", textTransform: "uppercase" }}>Vehicle</span>
                        <strong style={{ color: "var(--color-text)" }}>{vehicleInfo}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--color-muted)", display: "block", fontSize: "0.65rem", textTransform: "uppercase" }}>Est. Cost</span>
                        <strong style={{ color: "var(--color-text)" }}>{formatInr(log.estimated_cost)}</strong>
                      </div>
                    </div>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid var(--color-border)",
                      paddingTop: "12px",
                      marginTop: "4px"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--color-muted-2)" }}>
                          Opened: {log.opened_at ? new Date(log.opened_at).toLocaleDateString() : "—"}
                        </span>
                        {log.closed_at && (
                          <span style={{ fontSize: "0.65rem", color: "var(--color-success)" }}>
                            Closed: {new Date(log.closed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {isOpen && allowManage && (
                        <Button
                          style={{
                            background: "var(--color-success, #22c55e)",
                            color: "#000",
                            border: "none",
                            padding: "5px 12px",
                            fontSize: "0.74rem",
                            fontWeight: 700
                          }}
                          onClick={() => void handleCloseMaintenance(log.id)}
                        >
                          Close Order
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {logs && (
            <Pagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
          )}
        </div>
      </div>

      {/* Open Maintenance Modal */}
      {isAdding && (
        <div className="modal-overlay">
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
                    <label htmlFor="maintDesc" className="form-field__label">Detailed Description</label>
                    <textarea
                      id="maintDesc"
                      className="form-field__input"
                      rows={3}
                      placeholder="Specify issue detail, components, or labor details"
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
