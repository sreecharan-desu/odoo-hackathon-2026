import { useState, useEffect } from "react";
import { Card, Spinner, Button } from "../components/ui";
import { useApiList } from "../hooks/useApiList";
import { endpoints, apiPost, apiGet } from "../lib/api";
import type { Trip, Vehicle, Driver } from "../types";

export default function TripsPage() {
  const { data: trips, error: tripsError, loading: tripsLoading, refetch: refetchTrips } = useApiList<Trip[]>(endpoints.trips);
  
  // Available assets for dispatch
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Modals & form state
  const [isAdding, setIsAdding] = useState(false);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDist, setPlannedDist] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Completion modal state
  const [completingTripId, setCompletingTripId] = useState<number | null>(null);
  const [finalOdo, setFinalOdo] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  // Fetch available vehicles and drivers when scheduling a trip
  const fetchAvailableAssets = async () => {
    setLoadingAssets(true);
    try {
      // 1. Fetch vehicles in dispatch pool
      const vehicles = await apiGet<Vehicle[]>("/api/vehicles/dispatch-pool").catch(() => 
        // Fallback: fetch all and filter Available
        apiGet<Vehicle[]>(endpoints.vehicles).then(res => res.filter(v => v.status === "Available"))
      );
      setAvailableVehicles(vehicles);

      // 2. Fetch drivers and filter Available
      const drivers = await apiGet<Driver[]>(endpoints.drivers).then(res => 
        res.filter(d => d.status === "Available")
      );
      setAvailableDrivers(drivers);
    } catch (err) {
      console.error("Failed to load assets", err);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    if (isAdding) {
      void fetchAvailableAssets();
    }
  }, [isAdding]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await apiPost(endpoints.trips, {
        source,
        destination,
        vehicle_id: parseInt(vehicleId),
        driver_id: parseInt(driverId),
        cargo_weight: parseFloat(cargoWeight),
        planned_distance: plannedDist ? parseFloat(plannedDist) : 0
      });
      setIsAdding(false);
      // Reset form
      setSource("");
      setDestination("");
      setVehicleId("");
      setDriverId("");
      setCargoWeight("");
      setPlannedDist("");
      void refetchTrips();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async (tripId: number) => {
    try {
      await apiPost(`/api/trips/${tripId}/dispatch`, {});
      void refetchTrips();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to dispatch trip");
    }
  };

  const handleCancel = async (tripId: number) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    try {
      await apiPost(`/api/trips/${tripId}/cancel`, {});
      void refetchTrips();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel trip");
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (completingTripId === null) return;
    setCompleteError(null);
    setCompleting(true);
    try {
      await apiPost(`/api/trips/${completingTripId}/complete`, {
        final_odometer: parseFloat(finalOdo),
        fuel_consumed: parseFloat(fuelConsumed),
        fuel_cost: parseFloat(fuelCost || "0")
      });
      setCompletingTripId(null);
      setFinalOdo("");
      setFuelConsumed("");
      setFuelCost("");
      void refetchTrips();
    } catch (err) {
      setCompleteError(err instanceof Error ? err.message : "Failed to complete trip");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Trip Dispatcher</h2>
          <p className="text-muted">Schedule routes, dispatch vehicles, and track cargo transit stages</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>Schedule Trip</Button>
      </div>

      <Card>
        {tripsLoading && <Spinner />}
        {tripsError && <p className="error">{tripsError}</p>}
        {trips && trips.length === 0 && (
          <p className="page-empty">No trips scheduled yet.</p>
        )}
        {trips && trips.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>ID</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Route</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Vehicle ID</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Driver ID</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Cargo Weight</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Distance</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Stepper Status</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>#{t.id}</td>
                    <td style={{ padding: "var(--space-2)" }}>{t.source} → {t.destination}</td>
                    <td style={{ padding: "var(--space-2)" }}>Vehicle #{t.vehicle_id}</td>
                    <td style={{ padding: "var(--space-2)" }}>Driver #{t.driver_id}</td>
                    <td style={{ padding: "var(--space-2)" }}>{t.cargo_weight} kg</td>
                    <td style={{ padding: "var(--space-2)" }}>{t.planned_distance} km</td>
                    <td style={{ padding: "var(--space-2)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: t.status === "Completed" ? "rgba(40, 167, 69, 0.15)" :
                                      t.status === "Dispatched" ? "rgba(0, 123, 255, 0.15)" :
                                      t.status === "Cancelled" ? "rgba(220, 53, 69, 0.15)" :
                                      "rgba(255, 193, 7, 0.15)",
                          color: t.status === "Completed" ? "#28a745" :
                                 t.status === "Dispatched" ? "#007bff" :
                                 t.status === "Cancelled" ? "#dc3545" :
                                 "#ffc107"
                        }}>
                          {t.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "var(--space-2)" }}>
                      {t.status === "Draft" && (
                        <Button style={{ padding: "4px 8px", fontSize: "0.85rem" }} onClick={() => void handleDispatch(t.id)}>Dispatch</Button>
                      )}
                      {t.status === "Dispatched" && (
                        <div style={{ display: "flex", gap: "var(--space-1)" }}>
                          <Button style={{ background: "#28a745", padding: "4px 8px", fontSize: "0.85rem" }} onClick={() => setCompletingTripId(t.id)}>Complete</Button>
                          <Button variant="ghost" style={{ border: "1px solid #dc3545", color: "#dc3545", padding: "4px 8px", fontSize: "0.85rem" }} onClick={() => void handleCancel(t.id)}>Cancel</Button>
                        </div>
                      )}
                      {t.status === "Completed" && (
                        <span style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>Closed</span>
                      )}
                      {t.status === "Cancelled" && (
                        <span style={{ fontSize: "0.85rem", color: "var(--color-error)" }}>Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Schedule Trip Modal */}
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
            <h3 style={{ margin: "0 0 var(--space-3)" }}>Schedule New Trip</h3>
            {loadingAssets ? (
              <Spinner />
            ) : (
              <form onSubmit={(e) => void handleCreateTrip(e)}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                    <div>
                      <label htmlFor="source" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Source Route *</label>
                      <input
                        id="source"
                        type="text"
                        required
                        placeholder="e.g. Warehouse A"
                        style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="destination" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Destination Route *</label>
                      <input
                        id="destination"
                        type="text"
                        required
                        placeholder="e.g. Client Site B"
                        style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="vehicle" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Select Vehicle *</label>
                    <select
                      id="vehicle"
                      required
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                    >
                      <option value="">-- Choose Available Vehicle --</option>
                      {availableVehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.registration_number} - {v.name} (Max Load: {v.max_load_kg} kg)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="driver" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Select Driver *</label>
                    <select
                      id="driver"
                      required
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                    >
                      <option value="">-- Choose Available Driver --</option>
                      {availableDrivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} (Safety: {d.safety_score})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                    <div>
                      <label htmlFor="cargo" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Cargo Weight (kg) *</label>
                      <input
                        id="cargo"
                        type="number"
                        required
                        min="1"
                        style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                        value={cargoWeight}
                        onChange={(e) => setCargoWeight(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="distance" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Planned Distance (km)</label>
                      <input
                        id="distance"
                        type="number"
                        min="1"
                        style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                        value={plannedDist}
                        onChange={(e) => setPlannedDist(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                {formError && <p className="error" style={{ marginBottom: "var(--space-3)" }}>{formError}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Draft"}</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Complete Trip Modal */}
      {completingTripId !== null && (
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
            <h3 style={{ margin: "0 0 var(--space-3)" }}>Complete Trip #{completingTripId}</h3>
            <form onSubmit={(e) => void handleCompleteSubmit(e)}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                <div>
                  <label htmlFor="finalOdo" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Final Odometer Reading (km) *</label>
                  <input
                    id="finalOdo"
                    type="number"
                    required
                    min="0"
                    style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                    value={finalOdo}
                    onChange={(e) => setFinalOdo(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="fuelConsumed" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Fuel Consumed (Liters) *</label>
                  <input
                    id="fuelConsumed"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="fuelCost" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Total Fuel Cost ($)</label>
                  <input
                    id="fuelCost"
                    type="number"
                    min="0"
                    step="0.01"
                    style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                  />
                </div>
              </div>
              {completeError && <p className="error" style={{ marginBottom: "var(--space-3)" }}>{completeError}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                <Button type="button" variant="ghost" onClick={() => setCompletingTripId(null)}>Cancel</Button>
                <Button type="submit" disabled={completing} style={{ background: "#28a745" }}>
                  {completing ? "Completing..." : "Complete & Logs"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
