import { useState, useEffect } from "react";
import { Card, Spinner, Button } from "../components/ui";
import { TextField, NumberField, SelectField } from "../components/forms";
import * as validators from "../lib/validators";
import { useApiList } from "../hooks/useApiList";
import { endpoints, apiPost, apiGet } from "../lib/api";
import type { Trip, Vehicle, Driver } from "../types";

export default function TripsPage() {
  const { data: trips, error: tripsError, loading: tripsLoading, refetch: refetchTrips } = useApiList<Trip[]>(endpoints.trips);
  
  // All assets loaded for list lookup and select dropdowns
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Modals & form state
  const [isAdding, setIsAdding] = useState(false);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDist, setPlannedDist] = useState("");

  // Input validation states
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [vehicleIdError, setVehicleIdError] = useState<string | null>(null);
  const [driverIdError, setDriverIdError] = useState<string | null>(null);
  const [cargoWeightError, setCargoWeightError] = useState<string | null>(null);
  const [plannedDistError, setPlannedDistError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dispatch errors state
  const [dispatchError, setDispatchError] = useState<Record<number, string | null>>({});

  // Completion modal state
  const [completingTripId, setCompletingTripId] = useState<number | null>(null);
  const [finalOdo, setFinalOdo] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [fuelCost, setFuelCost] = useState("");

  // Complete validation states
  const [finalOdoError, setFinalOdoError] = useState<string | null>(null);
  const [fuelConsumedError, setFuelConsumedError] = useState<string | null>(null);
  const [fuelCostError, setFuelCostError] = useState<string | null>(null);

  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  // Fetch all vehicles and drivers
  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const vehicles = await apiGet<Vehicle[]>(endpoints.vehicles);
      setAllVehicles(vehicles);

      const drivers = await apiGet<Driver[]>(endpoints.drivers);
      setAllDrivers(drivers);
    } catch (err) {
      console.error("Failed to load assets", err);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    void fetchAssets();
  }, [trips, isAdding]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate inputs using Anand's validators
    const srcErr = validators.required(source, "Source Route");
    const destErr = validators.required(destination, "Destination Route");
    const vehErr = validators.required(vehicleId, "Vehicle Selection");
    const drvErr = validators.required(driverId, "Driver Selection");
    const cargoErr = validators.positiveNumber(cargoWeight, "Cargo Weight");
    const distErr = plannedDist ? (parseFloat(plannedDist) <= 0 ? "Planned distance must be greater than zero" : null) : null;

    let capacityErr: string | null = null;
    let licenseErr: string | null = null;

    if (!vehErr && vehicleId) {
      const selectedVehicle = allVehicles.find(v => v.id === parseInt(vehicleId));
      if (selectedVehicle) {
        capacityErr = validators.cargoWithinMaxLoad(parseFloat(cargoWeight), selectedVehicle.max_load_kg);
      }
    }

    if (!drvErr && driverId) {
      const selectedDriver = allDrivers.find(d => d.id === parseInt(driverId));
      if (selectedDriver) {
        licenseErr = validators.licenseNotExpired(selectedDriver.license_expiry, new Date(), selectedDriver.name);
      }
    }

    setSourceError(srcErr);
    setDestinationError(destErr);
    setVehicleIdError(vehErr);
    setDriverIdError(drvErr || licenseErr);
    setCargoWeightError(capacityErr || cargoErr);
    setPlannedDistError(distErr);

    if (srcErr || destErr || vehErr || drvErr || cargoErr || capacityErr || licenseErr || distErr) {
      return;
    }

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
    setDispatchError(prev => ({ ...prev, [tripId]: null }));
    try {
      await apiPost(`/api/trips/${tripId}/dispatch`, {});
      void refetchTrips();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to dispatch trip";
      setDispatchError(prev => ({ ...prev, [tripId]: msg }));
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

    // Validate inputs
    const odoNumErr = validators.positiveNumber(finalOdo, "Final Odometer");
    const fuelErr = validators.positiveNumber(fuelConsumed, "Fuel Consumed");
    const costErr = fuelCost && parseFloat(fuelCost) < 0 ? "Fuel cost cannot be negative" : null;

    setFinalOdoError(odoNumErr);
    setFuelConsumedError(fuelErr);
    setFuelCostError(costErr);

    if (odoNumErr || fuelErr || costErr) {
      return;
    }

    setCompleting(true);
    try {
      // Find current vehicle odometer to run odometerNotBelowCurrent
      const trip = trips?.find(t => t.id === completingTripId);
      if (trip) {
        const vehicle = await apiGet<Vehicle>(`/api/vehicles/${trip.vehicle_id}`);
        const odometerCheck = validators.odometerNotBelowCurrent(parseFloat(finalOdo), vehicle.odometer);
        if (odometerCheck) {
          setFinalOdoError(odometerCheck);
          setCompleting(false);
          return;
        }
      }

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
                {trips.map((t) => {
                  const vehicle = allVehicles.find(v => v.id === t.vehicle_id);
                  const driver = allDrivers.find(d => d.id === t.driver_id);
                  const isVehicleAvailable = vehicle ? vehicle.status === "Available" : true;
                  const isDriverAvailable = driver ? driver.status === "Available" : true;
                  const canDispatch = isVehicleAvailable && isDriverAvailable;

                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>#{t.id}</td>
                      <td style={{ padding: "var(--space-2)" }}>{t.source} → {t.destination}</td>
                      <td style={{ padding: "var(--space-2)" }}>
                        Vehicle #{t.vehicle_id}
                        {vehicle && vehicle.status !== "Available" && (
                          <span style={{ fontSize: "0.75rem", color: "var(--color-error)", display: "block" }}>({vehicle.status})</span>
                        )}
                      </td>
                      <td style={{ padding: "var(--space-2)" }}>
                        Driver #{t.driver_id}
                        {driver && driver.status !== "Available" && (
                          <span style={{ fontSize: "0.75rem", color: "var(--color-error)", display: "block" }}>({driver.status})</span>
                        )}
                      </td>
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
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <Button 
                              style={{ padding: "4px 8px", fontSize: "0.85rem" }} 
                              onClick={() => void handleDispatch(t.id)}
                              disabled={!canDispatch}
                            >
                              Dispatch
                            </Button>
                            {!canDispatch && (
                              <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                                Assets busy/shop
                              </span>
                            )}
                            {dispatchError[t.id] && (
                              <p className="error" style={{ fontSize: "0.75rem", margin: "4px 0 0", maxWidth: "150px" }}>
                                {dispatchError[t.id]}
                              </p>
                            )}
                          </div>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Trip Modal */}
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
                    <TextField
                      id="source"
                      label="Source Route *"
                      required
                      placeholder="e.g. Warehouse A"
                      value={source}
                      error={sourceError}
                      onChange={(e) => {
                        setSource(e.target.value);
                        if (sourceError) setSourceError(null);
                      }}
                    />
                    <TextField
                      id="destination"
                      label="Destination Route *"
                      required
                      placeholder="e.g. Client Site B"
                      value={destination}
                      error={destinationError}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        if (destinationError) setDestinationError(null);
                      }}
                    />
                  </div>

                  <SelectField
                    id="vehicle"
                    label="Select Vehicle *"
                    required
                    options={allVehicles.map(v => ({
                      value: String(v.id),
                      label: `${v.registration_number} - ${v.name} (Max: ${v.max_load_kg} kg) [${v.status}]`
                    }))}
                    placeholder="-- Select Vehicle --"
                    value={vehicleId}
                    error={vehicleIdError}
                    onChange={(e) => {
                      setVehicleId(e.target.value);
                      if (vehicleIdError) setVehicleIdError(null);
                    }}
                  />

                  <SelectField
                    id="driver"
                    label="Select Driver *"
                    required
                    options={allDrivers.map(d => ({
                      value: String(d.id),
                      label: `${d.name} (Safety: ${d.safety_score}) [${d.status}]`
                    }))}
                    placeholder="-- Select Driver --"
                    value={driverId}
                    error={driverIdError}
                    onChange={(e) => {
                      setDriverId(e.target.value);
                      if (driverIdError) setDriverIdError(null);
                    }}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                    <NumberField
                      id="cargo"
                      label="Cargo Weight (kg) *"
                      required
                      min={1}
                      value={cargoWeight}
                      error={cargoWeightError}
                      onChange={(e) => {
                        setCargoWeight(e.target.value);
                        if (cargoWeightError) setCargoWeightError(null);
                      }}
                    />
                    <NumberField
                      id="distance"
                      label="Planned Distance (km)"
                      min={1}
                      value={plannedDist}
                      error={plannedDistError}
                      onChange={(e) => {
                        setPlannedDist(e.target.value);
                        if (plannedDistError) setPlannedDistError(null);
                      }}
                    />
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
                <NumberField
                  id="finalOdo"
                  label="Final Odometer Reading (km) *"
                  required
                  min={0}
                  value={finalOdo}
                  error={finalOdoError}
                  onChange={(e) => {
                    setFinalOdo(e.target.value);
                    if (finalOdoError) setFinalOdoError(null);
                  }}
                />
                <NumberField
                  id="fuelConsumed"
                  label="Fuel Consumed (Liters) *"
                  required
                  min={0}
                  step="0.01"
                  value={fuelConsumed}
                  error={fuelConsumedError}
                  onChange={(e) => {
                    setFuelConsumed(e.target.value);
                    if (fuelConsumedError) setFuelConsumedError(null);
                  }}
                />
                <NumberField
                  id="fuelCost"
                  label="Total Fuel Cost ($)"
                  min={0}
                  step="0.01"
                  value={fuelCost}
                  error={fuelCostError}
                  onChange={(e) => {
                    setFuelCost(e.target.value);
                    if (fuelCostError) setFuelCostError(null);
                  }}
                />
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
