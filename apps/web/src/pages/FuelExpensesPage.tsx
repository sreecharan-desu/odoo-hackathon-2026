import { useState, useEffect } from "react";
import { Card, Spinner, Button, Pagination } from "../components/ui";
import { TextField, NumberField, SelectField } from "../components/forms";
import * as validators from "../lib/validators";
import { useApiList } from "../hooks/useApiList";
import { endpoints, apiPost, apiGetItems } from "../lib/api";
import type { FuelLog, Expense, Vehicle } from "../types";

const PAGE_SIZE = 25;

export default function FuelExpensesPage() {
  const [fuelOffset, setFuelOffset] = useState(0);
  const [expenseOffset, setExpenseOffset] = useState(0);
  const { data: fuelLogs, total: fuelTotal, error: fuelError, loading: fuelLoading, refetch: refetchFuel } = useApiList<FuelLog>(
    endpoints.fuelLogs,
    { limit: PAGE_SIZE, offset: fuelOffset },
  );
  const { data: expenses, total: expenseTotal, error: expenseError, loading: expenseLoading, refetch: refetchExpenses } = useApiList<Expense>(
    endpoints.expenses,
    { limit: PAGE_SIZE, offset: expenseOffset },
  );

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

  // Input validation states
  const [vehicleIdError, setVehicleIdError] = useState<string | null>(null);
  const [litersError, setLitersError] = useState<string | null>(null);
  const [costError, setCostError] = useState<string | null>(null);
  const [tripIdError, setTripIdError] = useState<string | null>(null);
  
  const [expenseVehicleIdError, setExpenseVehicleIdError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isFuelModal || isExpenseModal) {
      setLoadingVehicles(true);
      void apiGetItems<Vehicle>(endpoints.vehicles)
        .then((res) => setVehicles(res))
        .catch((err) => console.error(err))
        .finally(() => setLoadingVehicles(false));
    }
  }, [isFuelModal, isExpenseModal]);

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate inputs
    const vehErr = validators.required(vehicleId, "Vehicle Selection");
    const litersErr = validators.positiveNumber(liters, "Liters");
    const costErr = validators.positiveNumber(cost, "Total Cost");
    const tripErr = tripId && parseFloat(tripId) < 0 ? "Trip ID cannot be negative" : null;

    setVehicleIdError(vehErr);
    setLitersError(litersErr);
    setCostError(costErr);
    setTripIdError(tripErr);

    if (vehErr || litersErr || costErr || tripErr) {
      return;
    }

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

    // Validate inputs
    const vehErr = validators.required(vehicleId, "Vehicle Selection");
    const catErr = validators.required(category, "Category");
    const amtErr = validators.positiveNumber(amount, "Amount");

    setExpenseVehicleIdError(vehErr);
    setCategoryError(catErr);
    setAmountError(amtErr);

    if (vehErr || catErr || amtErr) {
      return;
    }

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
          {fuelLogs && (
            <Pagination total={fuelTotal} limit={PAGE_SIZE} offset={fuelOffset} onChange={setFuelOffset} />
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
          {expenses && (
            <Pagination total={expenseTotal} limit={PAGE_SIZE} offset={expenseOffset} onChange={setExpenseOffset} />
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
                  <SelectField
                    id="fuelVehicle"
                    label="Select Vehicle *"
                    required
                    options={vehicles.map(v => ({
                      value: String(v.id),
                      label: `${v.registration_number} - ${v.name}`
                    }))}
                    placeholder="-- Choose Vehicle --"
                    value={vehicleId}
                    error={vehicleIdError}
                    onChange={(e) => {
                      setVehicleId(e.target.value);
                      if (vehicleIdError) setVehicleIdError(null);
                    }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                    <NumberField
                      id="fuelLiters"
                      label="Liters *"
                      required
                      min={0.1}
                      step="0.01"
                      value={liters}
                      error={litersError}
                      onChange={(e) => {
                        setLiters(e.target.value);
                        if (litersError) setLitersError(null);
                      }}
                    />
                    <NumberField
                      id="fuelCostVal"
                      label="Total Cost ($) *"
                      required
                      min={0}
                      step="0.01"
                      value={cost}
                      error={costError}
                      onChange={(e) => {
                        setCost(e.target.value);
                        if (costError) setCostError(null);
                      }}
                    />
                  </div>
                  <NumberField
                    id="fuelTrip"
                    label="Trip ID (Optional)"
                    placeholder="e.g. 5"
                    value={tripId}
                    error={tripIdError}
                    onChange={(e) => {
                      setTripId(e.target.value);
                      if (tripIdError) setTripIdError(null);
                    }}
                  />
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
                  <SelectField
                    id="expVehicle"
                    label="Select Vehicle *"
                    required
                    options={vehicles.map(v => ({
                      value: String(v.id),
                      label: `${v.registration_number} - ${v.name}`
                    }))}
                    placeholder="-- Choose Vehicle --"
                    value={vehicleId}
                    error={expenseVehicleIdError}
                    onChange={(e) => {
                      setVehicleId(e.target.value);
                      if (expenseVehicleIdError) setExpenseVehicleIdError(null);
                    }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                    <SelectField
                      id="expCategory"
                      label="Category *"
                      required
                      options={[
                        { value: "Toll", label: "Toll" },
                        { value: "Permit", label: "Permit" },
                        { value: "Fine", label: "Fine" },
                        { value: "Cleaning", label: "Cleaning" },
                        { value: "Other", label: "Other" }
                      ]}
                      placeholder="-- Select Category --"
                      value={category}
                      error={categoryError}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (categoryError) setCategoryError(null);
                      }}
                    />
                    <NumberField
                      id="expAmount"
                      label="Amount ($) *"
                      required
                      min={0.01}
                      step="0.01"
                      value={amount}
                      error={amountError}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (amountError) setAmountError(null);
                      }}
                    />
                  </div>
                  <TextField
                    id="expNote"
                    label="Note/Explanation"
                    placeholder="e.g. Route 66 Toll fee"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
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
