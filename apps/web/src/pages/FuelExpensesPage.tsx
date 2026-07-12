import { useState, useEffect, useMemo, useRef } from "react";
import { Card, Spinner, Button } from "../components/ui";
import { TextField, NumberField, SelectField } from "../components/forms";
import * as validators from "../lib/validators";
import { useAuth } from "../hooks/useAuth";
import { endpoints, apiPost, apiGetItems } from "../lib/api";
import { canLogFuel, canManageExpenses, pageChrome } from "../lib/rbac";
import { formatInr } from "../constants";
import type { FuelLog, Expense, Vehicle } from "../types";

export default function FuelExpensesPage() {
  const { user } = useAuth();
  const allowFuel = canLogFuel(user);
  const allowExpense = canManageExpenses(user);
  const chrome = pageChrome(user, "fuel");

  const [graphCategory, setGraphCategory] = useState("All");
  const [allFuelLogs, setAllFuelLogs] = useState<FuelLog[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [graphError, setGraphError] = useState<string | null>(null);

  const fetchGraphData = async () => {
    setLoadingGraph(true);
    setGraphError(null);
    try {
      const [fuelRes, expRes] = await Promise.all([
        apiGetItems<FuelLog>(endpoints.fuelLogs, { limit: 100 }),
        apiGetItems<Expense>(endpoints.expenses, { limit: 100 }),
      ]);
      setAllFuelLogs(fuelRes);
      setAllExpenses(expRes);
    } catch (err) {
      console.error("Failed to load graph data", err);
      setGraphError(err instanceof Error ? err.message : "Failed to load operating data");
    } finally {
      setLoadingGraph(false);
    }
  };

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      void fetchGraphData();
    }
  }, []);

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
      void fetchGraphData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to log fuel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

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
      void fetchGraphData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to log expense");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const fuelList = allFuelLogs;
    const expenseList = allExpenses;

    const totalFuelCost = fuelList.reduce((sum, log) => sum + log.cost, 0);
    const totalFuelLiters = fuelList.reduce((sum, log) => sum + log.liters, 0);
    const totalExpenseCost = expenseList.reduce((sum, exp) => sum + exp.amount, 0);
    const totalSpend = totalFuelCost + totalExpenseCost;
    
    const avgFuelPrice = totalFuelLiters > 0 ? totalFuelCost / totalFuelLiters : 0;
    const refillCount = fuelList.length;

    return { totalSpend, totalFuelCost, totalExpenseCost, refillCount, avgFuelPrice };
  }, [allFuelLogs, allExpenses]);

  const chartData = useMemo(() => {
    const list: { date: Date; amount: number; type: string }[] = [];
    
    if (graphCategory === "All" || graphCategory === "Fuel") {
      allFuelLogs.forEach(log => {
        if (log.logged_at) {
          list.push({
            date: new Date(log.logged_at),
            amount: log.cost,
            type: "Fuel"
          });
        }
      });
    }

    allExpenses.forEach(exp => {
      if (exp.logged_at) {
        if (graphCategory === "All" || graphCategory === exp.category) {
          list.push({
            date: new Date(exp.logged_at),
            amount: exp.amount,
            type: exp.category
          });
        }
      }
    });

    list.sort((a, b) => a.date.getTime() - b.date.getTime());

    const groups: Record<string, { total: number; timestamp: number }> = {};
    list.forEach(item => {
      const day = item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!groups[day]) {
        groups[day] = { total: 0, timestamp: item.date.getTime() };
      }
      groups[day].total += item.amount;
    });

    return Object.entries(groups)
      .map(([day, val]) => ({ day, ...val }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-12);
  }, [allFuelLogs, allExpenses, graphCategory]);

  const maxVal = Math.max(...chartData.map(d => d.total), 1000);
  const width = 800;
  const height = 220;
  const paddingX = 55;
  const paddingY = 30;

  const points = chartData.map((d, i) => {
    const x = paddingX + (i / Math.max(chartData.length - 1, 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (d.total / maxVal) * (height - 2 * paddingY);
    return { x, y, label: d.day, val: d.total };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  const gridLines = [0.25, 0.5, 0.75, 1].map(pct => {
    const y = height - paddingY - pct * (height - 2 * paddingY);
    const valLabel = `₹${(pct * maxVal).toFixed(0)}`;
    return { y, valLabel };
  });

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>{chrome.title}</h2>
          <p className="text-muted">{chrome.sub}</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {allowFuel && <Button onClick={() => setIsFuelModal(true)}>Log Fuel</Button>}
          {allowExpense && <Button onClick={() => setIsExpenseModal(true)} variant="ghost">Log Expense</Button>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {/* KPI Summary Cards & Spend Graph */}
        <Card style={{ padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "0.72rem", letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>
            Operating Spend Overview
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>Total Spend</span>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>{formatInr(stats.totalSpend)}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>Fuel Refills</span>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>{stats.refillCount} refills</div>
            </div>
            <div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>Avg Fuel Price</span>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>{formatInr(stats.avgFuelPrice)}/L</div>
            </div>
            <div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>Other Expenses</span>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>{formatInr(stats.totalExpenseCost)}</div>
            </div>
          </div>

          {/* Graph Title & Filter Category selector */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>SPEND TREND</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>Category:</span>
              <select
                value={graphCategory}
                onChange={(e) => setGraphCategory(e.target.value)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="All">All Operating Spend</option>
                <option value="Fuel">Fuel Refills</option>
                <option value="Toll">Toll Fees</option>
                <option value="Permit">Permits</option>
                <option value="Fine">Fines / Penalties</option>
                <option value="Cleaning">Cleaning / Maintenance</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>
          </div>

          {/* SVG Spend Graph */}
          {loadingGraph ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Spinner /></div>
          ) : graphError ? (
            <p className="error" style={{ textAlign: "center", padding: "20px" }}>{graphError}</p>
          ) : chartData.length > 0 ? (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <div style={{ minWidth: "800px", position: "relative" }}>
                <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {gridLines.map((g, idx) => (
                    <g key={idx}>
                      <line
                        x1={paddingX}
                        y1={g.y}
                        x2={width - paddingX}
                        y2={g.y}
                        stroke="var(--color-border)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 10}
                        y={g.y + 4}
                        fill="var(--color-muted)"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="end"
                      >
                        {g.valLabel}
                      </text>
                    </g>
                  ))}

                  {/* Area path */}
                  {areaD && (
                    <path
                      d={areaD}
                      fill="url(#areaGrad)"
                    />
                  )}

                  {/* Line path */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="var(--color-primary, #3b82f6)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Day labels & points */}
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="var(--color-paper)"
                        stroke="var(--color-primary, #3b82f6)"
                        strokeWidth="2.5"
                      />
                      <text
                        x={p.x}
                        y={height - 10}
                        fill="var(--color-muted)"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {p.label}
                      </text>
                      <text
                        x={p.x}
                        y={p.y - 10}
                        fill="var(--color-text)"
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        ₹{p.val.toFixed(0)}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          ) : (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--color-muted)", fontSize: "0.875rem", border: "1px dashed var(--color-border)", borderRadius: "8px" }}>
              No spend data available to plot trend graph for selected category.
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
                      label="Total Cost (₹) *"
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
                      label="Amount (₹) *"
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
