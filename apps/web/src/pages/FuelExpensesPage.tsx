import { useState, useEffect } from "react";
import { Card, Spinner, Button } from "../components/ui";
import { useApiList } from "../hooks/useApiList";
import { endpoints, apiPost, apiGet } from "../lib/api";
import type { FuelLog, Expense, Vehicle } from "../types";

export default function FuelExpensesPage() {
  const { data: fuelLogs, error: fuelError, loading: fuelLoading, refetch: refetchFuel } = useApiList<FuelLog[]>(endpoints.fuelLogs);
  const { data: expenses, error: expenseError, loading: expenseLoading, refetch: refetchExpenses } = useApiList<Expense[]>(endpoints.expenses);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Modals state
  const [isFuelModal, setIsFuelModal] = useState(false);
  const [isExpenseModal, setIsExpenseModal] = useState(false);

  // Form states
  const [vehicleId, setVehicleId] = useState("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [tripId, setTripId] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isFuelModal || isExpenseModal) {
      setLoadingVehicles(true);
      void apiGet<Vehicle[]>(endpoints.vehicles)
        .then((res) => setVehicles(res))
        .catch((err) => console.error(err))
        .finally(() => setLoadingVehicles(false));
    }
  }, [isFuelModal, isExpenseModal]);

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await apiPost(endpoints.fuelLogs, {
        vehicle_id: parseInt(vehicleId),
        liters: parseFloat(liters),
        cost: parseFloat(cost),
        trip_id: tripId ? parseInt(tripId) : null
      });
      setIsFuelModal(false);
      setVehicleId("");
      setLiters("");
      setCost("");
      setTripId("");
      void refetchFuel();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to log fuel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await apiPost(endpoints.expenses, {
        vehicle_id: parseInt(vehicleId),
        category,
        amount: parseFloat(amount),
        note: note || null
      });
      setIsExpenseModal(false);
      setVehicleId("");
      setCategory("");
      setAmount("");
      setNote("");
      void refetchExpenses();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to log expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Fuel & Expenses</h2>
          <p className="text-muted">Track fuel logs, tolls, and operational charges across assets</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button onClick={() => setIsFuelModal(true)}>Log Fuel</Button>
          <Button onClick={() => setIsExpenseModal(true)} variant="ghost">Log Expense</Button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {/* Fuel Logs Section */}
        <Card>
          <h3 style={{ margin: "0 0 var(--space-3)" }}>Fuel Logs</h3>
          {fuelLoading && <Spinner />}
          {fuelError && <p className="error">{fuelError}</p>}
          {fuelLogs && fuelLogs.length === 0 && (
            <p className="page-empty">No fuel records logged yet.</p>
          )}
          {fuelLogs && fuelLogs.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>ID</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Vehicle ID</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Liters</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Total Cost</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Trip ID</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Logged At</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>#{log.id}</td>
                      <td style={{ padding: "var(--space-2)" }}>Vehicle #{log.vehicle_id}</td>
                      <td style={{ padding: "var(--space-2)" }}>{log.liters} L</td>
                      <td style={{ padding: "var(--space-2)" }}>${log.cost.toLocaleString()}</td>
                      <td style={{ padding: "var(--space-2)" }}>{log.trip_id ? `#${log.trip_id}` : "—"}</td>
                      <td style={{ padding: "var(--space-2)", fontSize: "0.85rem", color: "var(--color-muted)" }}>
                        {log.logged_at ? new Date(log.logged_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Expenses Section */}
        <Card>
          <h3 style={{ margin: "0 0 var(--space-3)" }}>Other Operating Expenses</h3>
          {expenseLoading && <Spinner />}
          {expenseError && <p className="error">{expenseError}</p>}
          {expenses && expenses.length === 0 && (
            <p className="page-empty">No expenses logged yet.</p>
          )}
          {expenses && expenses.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>ID</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Vehicle ID</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Category</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Amount</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Note</th>
                    <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Logged At</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>#{exp.id}</td>
                      <td style={{ padding: "var(--space-2)" }}>Vehicle #{exp.vehicle_id}</td>
                      <td style={{ padding: "var(--space-2)" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: "rgba(255,255,255,0.06)",
                          color: "var(--color-text)"
                        }}>{exp.category}</span>
                      </td>
                      <td style={{ padding: "var(--space-2)" }}>${exp.amount.toLocaleString()}</td>
                      <td style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>{exp.note ?? "—"}</td>
                      <td style={{ padding: "var(--space-2)", fontSize: "0.85rem", color: "var(--color-muted)" }}>
                        {exp.logged_at ? new Date(exp.logged_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Log Fuel Modal */}
      {isFuelModal && (
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
          <Card style={{ width: "100%", maxWidth: "450px" }}>
            <h3 style={{ margin: "0 0 var(--space-3)" }}>Log Fuel Refill</h3>
            {loadingVehicles ? (
              <Spinner />
            ) : (
              <form onSubmit={(e) => void handleLogFuel(e)}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                  <div>
                    <label htmlFor="fuelVehicle" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Select Vehicle *</label>
                    <select
                      id="fuelVehicle"
                      required
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                    >
                      <option value="">-- Choose Vehicle --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.registration_number} - {v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                    <div>
                      <label htmlFor="fuelLiters" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Liters *</label>
                      <input
                        id="fuelLiters"
                        type="number"
                        required
                        min="0.1"
                        step="0.01"
                        style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                        value={liters}
                        onChange={(e) => setLiters(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="fuelCostVal" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Total Cost ($) *</label>
                      <input
                        id="fuelCostVal"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="fuelTrip" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Trip ID (Optional)</label>
                    <input
                      id="fuelTrip"
                      type="number"
                      placeholder="e.g. 5"
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                      value={tripId}
                      onChange={(e) => setTripId(e.target.value)}
                    />
                  </div>
                </div>
                {formError && <p className="error" style={{ marginBottom: "var(--space-3)" }}>{formError}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                  <Button type="button" variant="ghost" onClick={() => setIsFuelModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? "Logging..." : "Log Fuel"}</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Log Expense Modal */}
      {isExpenseModal && (
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
          <Card style={{ width: "100%", maxWidth: "450px" }}>
            <h3 style={{ margin: "0 0 var(--space-3)" }}>Log Other Expense</h3>
            {loadingVehicles ? (
              <Spinner />
            ) : (
              <form onSubmit={(e) => void handleLogExpense(e)}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                  <div>
                    <label htmlFor="expVehicle" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Select Vehicle *</label>
                    <select
                      id="expVehicle"
                      required
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                    >
                      <option value="">-- Choose Vehicle --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.registration_number} - {v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                    <div>
                      <label htmlFor="expCategory" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Category *</label>
                      <select
                        id="expCategory"
                        required
                        style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="">-- Select Category --</option>
                        <option value="Toll">Toll</option>
                        <option value="Permit">Permit</option>
                        <option value="Fine">Fine</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="expAmount" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Amount ($) *</label>
                      <input
                        id="expAmount"
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="expNote" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Note/Explanation</label>
                    <input
                      id="expNote"
                      type="text"
                      placeholder="e.g. Route 66 Toll fee"
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
                {formError && <p className="error" style={{ marginBottom: "var(--space-3)" }}>{formError}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                  <Button type="button" variant="ghost" onClick={() => setIsExpenseModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? "Logging..." : "Log Expense"}</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
