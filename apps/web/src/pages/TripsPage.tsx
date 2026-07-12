import { useState, useEffect } from "react";
import { Card, Spinner, Button, Pagination } from "../components/ui";
import { TextField, NumberField, SelectField } from "../components/forms";
import * as validators from "../lib/validators";
import { useAuth } from "../hooks/useAuth";
import { useApiList } from "../hooks/useApiList";
import { endpoints, apiPost, apiGet, apiGetItems } from "../lib/api";
import { canDispatchTrips, canManageTrips, pageChrome } from "../lib/rbac";
import type { Trip, Vehicle, Driver } from "../types";
import "../components/layout/shell.css";

const PAGE_SIZE = 25;

export default function TripsPage() {
  const { user } = useAuth();
  const allowSchedule = canManageTrips(user);
  const allowDispatch = canDispatchTrips(user);
  const chrome = pageChrome(user, "trips");
  const [offset, setOffset] = useState(0);

  const { data: trips, total, error: tripsError, loading: tripsLoading, refetch: refetchTrips } = useApiList<Trip>(
    endpoints.trips,
    { limit: PAGE_SIZE, offset },
  );
  
  // Full lists for row lookups; dispatch-pool + Available drivers for create form
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [dispatchPool, setDispatchPool] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Form state
  const [source, setSource] = useState("Gandhinagar Depot");
  const [destination, setDestination] = useState("Ahmedabad Hub");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("450");
  const [plannedDist, setPlannedDist] = useState("38");

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

  const [finalOdoError, setFinalOdoError] = useState<string | null>(null);
  const [fuelConsumedError, setFuelConsumedError] = useState<string | null>(null);
  const [fuelCostError, setFuelCostError] = useState<string | null>(null);

  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const [vehicles, drivers, pool, availDrivers] = await Promise.all([
        apiGetItems<Vehicle>(endpoints.vehicles),
        apiGetItems<Driver>(endpoints.drivers),
        apiGet<Vehicle[]>(endpoints.vehicleDispatchPool),
        apiGetItems<Driver>(endpoints.drivers, { status: "Available" }),
      ]);
      setAllVehicles(vehicles);
      setAllDrivers(drivers);
      setDispatchPool(pool);
      setAvailableDrivers(availDrivers);
    } catch (err) {
      console.error("Failed to load assets", err);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    void fetchAssets();
  }, [trips]);

  // Find currently selected vehicle and driver metadata
  const selectedVehicle = dispatchPool.find(v => v.id === parseInt(vehicleId));
  const selectedDriver = availableDrivers.find(d => d.id === parseInt(driverId));

  // Determine if selected cargo weight exceeds vehicle capacity
  const capacityLimit = selectedVehicle ? selectedVehicle.max_load_kg : 0;
  const cargoWeightVal = parseFloat(cargoWeight) || 0;
  const isOverweight = selectedVehicle && cargoWeightVal > capacityLimit;
  const exceededWeight = isOverweight ? cargoWeightVal - capacityLimit : 0;

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

    if (!vehErr && selectedVehicle) {
      capacityErr = validators.cargoWithinMaxLoad(cargoWeightVal, selectedVehicle.max_load_kg);
    }

    if (!drvErr && selectedDriver) {
      licenseErr = validators.licenseNotExpired(selectedDriver.license_expiry, new Date(), selectedDriver.name);
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
        cargo_weight: cargoWeightVal,
        planned_distance: plannedDist ? parseFloat(plannedDist) : 0
      });
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
      <div className="page-header">
        <h2>{chrome.title}</h2>
        <p className="text-muted">{chrome.sub}</p>
      </div>

      <div className="split-pane-layout">
        {/* Left Side: Create Trip Form + Stepper */}
        <div className="split-pane-side" style={{ flex: 1.2 }}>
          {allowSchedule ? (
          <Card style={{ padding: "var(--space-4)" }}>
            <h3 style={{ margin: "0 0 var(--space-2)" }}>TRIP LIFECYCLE</h3>
            
            {/* Stepper progress */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              padding: "var(--space-2) 0 var(--space-4)",
              margin: "0 0 var(--space-3)"
            }}>
              <div style={{ position: "absolute", top: "18px", left: "10px", right: "10px", height: "2px", background: "rgba(255,255,255,0.08)", zIndex: 1 }} />
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 2 }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#28a745", border: "2px solid #28a745" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#28a745" }}>Draft</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 2 }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#007bff", border: "2px solid #007bff" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#007bff" }}>Dispatched</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 2 }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#333", border: "2px solid rgba(255,255,255,0.2)" }} />
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>Completed</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 2 }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#333", border: "2px solid rgba(255,255,255,0.2)" }} />
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>Cancelled</span>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.06)", margin: "0 0 var(--space-4)" }} />

            <h3 style={{ margin: "0 0 var(--space-3)" }}>CREATE TRIP</h3>
            {loadingAssets ? (
              <Spinner />
            ) : (
              <form onSubmit={(e) => void handleCreateTrip(e)}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                  <TextField
                    id="source"
                    label="SOURCE"
                    required
                    placeholder="Gandhinagar Depot"
                    value={source}
                    error={sourceError}
                    onChange={(e) => {
                      setSource(e.target.value);
                      if (sourceError) setSourceError(null);
                    }}
                  />
                  <TextField
                    id="destination"
                    label="DESTINATION"
                    required
                    placeholder="Ahmedabad Hub"
                    value={destination}
                    error={destinationError}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      if (destinationError) setDestinationError(null);
                    }}
                  />
                  <SelectField
                    id="vehicle"
                    label="VEHICLE (AVAILABLE ONLY)"
                    required
                    options={dispatchPool.map(v => ({
                      value: String(v.id),
                      label: `${v.registration_number} - ${v.max_load_kg} kg capacity`
                    }))}
                    placeholder={dispatchPool.length ? "-- Select Vehicle --" : "-- No vehicles in dispatch pool --"}
                    value={vehicleId}
                    error={vehicleIdError}
                    onChange={(e) => {
                      setVehicleId(e.target.value);
                      if (vehicleIdError) setVehicleIdError(null);
                    }}
                  />
                  <SelectField
                    id="driver"
                    label="DRIVER (AVAILABLE ONLY)"
                    required
                    options={availableDrivers.map(d => ({
                      value: String(d.id),
                      label: `${d.name}`
                    }))}
                    placeholder={availableDrivers.length ? "-- Select Driver --" : "-- No available drivers --"}
                    value={driverId}
                    error={driverIdError}
                    onChange={(e) => {
                      setDriverId(e.target.value);
                      if (driverIdError) setDriverIdError(null);
                    }}
                  />
                  <NumberField
                    id="cargo"
                    label="CARGO WEIGHT (KG)"
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
                    label="PLANNED DISTANCE (KM)"
                    min={1}
                    value={plannedDist}
                    error={plannedDistError}
                    onChange={(e) => {
                      setPlannedDist(e.target.value);
                      if (plannedDistError) setPlannedDistError(null);
                    }}
                  />
                </div>

                {/* Overweight Warnings Alertbox */}
                {isOverweight && (
                  <div className="warning-error-box">
                    <p className="warning-error-title">Vehicle Capacity: {capacityLimit} kg</p>
                    <p className="warning-error-desc">Cargo Weight: {cargoWeightVal} kg</p>
                    <p className="warning-error-detail">
                      <span>&#10006;</span> Capacity exceeded by {exceededWeight} kg - dispatch blocked
                    </p>
                  </div>
                )}

                {formError && <p className="error" style={{ marginBottom: "var(--space-3)" }}>{formError}</p>}
                
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
                  <Button 
                    type="submit" 
                    disabled={submitting || isOverweight}
                    style={{
                      flex: 1,
                      background: isOverweight ? "var(--color-bg)" : "#f0a500",
                      borderColor: isOverweight ? "rgba(255,255,255,0.08)" : "#f0a500",
                      color: isOverweight ? "var(--color-muted)" : "#000",
                      fontWeight: 700
                    }}
                  >
                    {isOverweight ? "Dispatch (disabled)" : submitting ? "Creating..." : "Create Draft"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => {
                      setSource("");
                      setDestination("");
                      setVehicleId("");
                      setDriverId("");
                      setCargoWeight("");
                      setPlannedDist("");
                      setFormError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
          ) : (
            <Card style={{ padding: "var(--space-4)" }}>
              <h3 style={{ margin: 0 }}>Trip create</h3>
              <p className="text-muted">Your role can view the live board but cannot schedule trips.</p>
            </Card>
          )}
        </div>

        {/* Right Side: LIVE BOARD trip cards */}
        <div className="split-pane-main">
          <Card style={{ padding: "var(--space-4)" }}>
            <h3 style={{ margin: "0 0 var(--space-4)" }}>LIVE BOARD</h3>
            {tripsLoading && <Spinner />}
            {tripsError && <p className="error">{tripsError}</p>}
            {trips && trips.length === 0 && (
              <p className="page-empty">No active trips scheduled yet.</p>
            )}
            
            {trips && trips.length > 0 && (
              <div className="live-board-container">
                {trips.map((t) => {
                  const vehicle = allVehicles.find(v => v.id === t.vehicle_id);
                  const driver = allDrivers.find(d => d.id === t.driver_id);
                  const isVehicleAvailable = vehicle ? vehicle.status === "Available" : true;
                  const isDriverAvailable = driver ? driver.status === "Available" : true;
                  const assetsReady = isVehicleAvailable && isDriverAvailable;

                  // Format ETA text to match mockup card descriptions
                  let etaLabel = "—";
                  if (t.status === "Dispatched") {
                    etaLabel = "45 min";
                  } else if (t.status === "Draft") {
                    etaLabel = "Awaiting driver";
                  } else if (t.status === "Cancelled") {
                    etaLabel = "Vehicle went to shop";
                  }

                  const tripCode = `TR${String(t.id).padStart(3, "0")}`;

                  return (
                    <div key={t.id} className="trip-live-card">
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "70%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <strong style={{ fontSize: "1.05rem" }}>{tripCode}</strong>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: t.status === "Completed" ? "rgba(40, 167, 69, 0.15)" :
                                        t.status === "Dispatched" ? "rgba(0, 123, 255, 0.15)" :
                                        t.status === "Cancelled" ? "rgba(220, 53, 69, 0.15)" :
                                        "rgba(108, 117, 125, 0.15)",
                            color: t.status === "Completed" ? "#28a745" :
                                   t.status === "Dispatched" ? "#007bff" :
                                   t.status === "Cancelled" ? "#dc3545" :
                                   "#6c757d"
                          }}>
                            {t.status}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--color-text)" }}>
                          {t.source} &rarr; {t.destination}
                        </p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", width: "30%", textAlign: "right" }}>
                        <span style={{ fontSize: "0.875rem", color: "var(--color-muted)", fontWeight: "500" }}>
                          {vehicle ? vehicle.registration_number : `V#${t.vehicle_id}`} / {driver ? driver.name : "Unassigned"}
                        </span>
                        <span style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>{etaLabel}</span>

                        <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                          {t.status === "Draft" && allowDispatch && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                              <Button 
                                style={{ padding: "2px 6px", fontSize: "0.8rem" }} 
                                onClick={() => void handleDispatch(t.id)}
                                disabled={!assetsReady}
                              >
                                Dispatch
                              </Button>
                              {dispatchError[t.id] && (
                                <p className="error" style={{ fontSize: "0.7rem", margin: "2px 0 0", maxWidth: "120px" }}>
                                  {dispatchError[t.id]}
                                </p>
                              )}
                            </div>
                          )}
                          {(t.status === "Draft" || t.status === "Dispatched") && allowSchedule && (
                            <div style={{ display: "flex", gap: "4px" }}>
                              {t.status === "Dispatched" && (
                                <Button style={{ background: "#28a745", padding: "2px 6px", fontSize: "0.8rem", color: "#fff" }} onClick={() => setCompletingTripId(t.id)}>Complete</Button>
                              )}
                              {allowSchedule && (
                                <Button variant="ghost" style={{ border: "1px solid #dc3545", color: "#dc3545", padding: "2px 6px", fontSize: "0.8rem" }} onClick={() => void handleCancel(t.id)}>Cancel</Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {trips && (
              <Pagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
            )}
            <p style={{ marginTop: "var(--space-4)", fontSize: "0.8125rem", color: "var(--color-muted)", fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "var(--space-2)" }}>
              On Complete: odometer &rarr; fuel log &rarr; expenses &rarr; Vehicle &amp; Driver Available
            </p>
          </Card>
        </div>
      </div>

      {/* Complete Trip Modal popup */}
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
                  label="Total Fuel Cost (₹)"
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
