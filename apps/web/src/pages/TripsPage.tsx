import { useState, useEffect, useRef, useMemo } from "react";
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

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Completed: { bg: "rgba(34,197,94,0.15)", text: "var(--color-success, #22c55e)" },
  Dispatched: { bg: "rgba(59,130,246,0.15)", text: "var(--color-info, #3b82f6)" },
  Cancelled: { bg: "rgba(239,68,68,0.15)", text: "var(--color-danger, #ef4444)" },
  Draft: { bg: "var(--color-surface-raised, rgba(128,128,128,0.12))", text: "var(--color-muted)" },
};

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

  // Assets loaded ONCE on mount — not on every trips refetch (fixes duplicate calls)
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [dispatchPool, setDispatchPool] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const assetsFetched = useRef(false);

  const fetchStaticAssets = async () => {
    try {
      const [vehicles, drivers] = await Promise.all([
        apiGetItems<Vehicle>(endpoints.vehicles),
        apiGetItems<Driver>(endpoints.drivers),
      ]);
      setAllVehicles(vehicles);
      setAllDrivers(drivers);
    } catch (err) {
      console.error("Failed to load static assets", err);
    }
  };

  const fetchDynamicAssets = async () => {
    setLoadingAssets(true);
    try {
      const [pool, availDrivers] = await Promise.all([
        apiGet<Vehicle[]>(endpoints.vehicleDispatchPool),
        apiGetItems<Driver>(endpoints.drivers, { status: "Available" }),
      ]);
      setDispatchPool(pool);
      setAvailableDrivers(availDrivers);
    } catch (err) {
      console.error("Failed to load dynamic assets", err);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Only fetch assets once on mount
  useEffect(() => {
    if (!assetsFetched.current) {
      assetsFetched.current = true;
      void fetchStaticAssets();
      void fetchDynamicAssets();
    }
  }, []);

  // Form state
  const [source, setSource] = useState("Gandhinagar Depot");
  const [destination, setDestination] = useState("Ahmedabad Hub");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("450");
  const [plannedDist, setPlannedDist] = useState("38");

  const [sourceError, setSourceError] = useState<string | null>(null);
  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [vehicleIdError, setVehicleIdError] = useState<string | null>(null);
  const [driverIdError, setDriverIdError] = useState<string | null>(null);
  const [cargoWeightError, setCargoWeightError] = useState<string | null>(null);
  const [plannedDistError, setPlannedDistError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dispatchError, setDispatchError] = useState<Record<number, string | null>>({});

  const [completingTripId, setCompletingTripId] = useState<number | null>(null);
  const [finalOdo, setFinalOdo] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [finalOdoError, setFinalOdoError] = useState<string | null>(null);
  const [fuelConsumedError, setFuelConsumedError] = useState<string | null>(null);
  const [fuelCostError, setFuelCostError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const selectedVehicle = dispatchPool.find(v => v.id === parseInt(vehicleId));
  const selectedDriver = availableDrivers.find(d => d.id === parseInt(driverId));
  const capacityLimit = selectedVehicle ? selectedVehicle.max_load_kg : 0;
  const cargoWeightVal = parseFloat(cargoWeight) || 0;
  const isOverweight = selectedVehicle && cargoWeightVal > capacityLimit;
  const exceededWeight = isOverweight ? cargoWeightVal - capacityLimit : 0;

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

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

    if (srcErr || destErr || vehErr || drvErr || cargoErr || capacityErr || licenseErr || distErr) return;

    setSubmitting(true);
    try {
      await apiPost(endpoints.trips, {
        source,
        destination,
        vehicle_id: parseInt(vehicleId),
        driver_id: parseInt(driverId),
        cargo_weight: cargoWeightVal,
        planned_distance: plannedDist ? parseFloat(plannedDist) : 0,
      });
      setSource("");
      setDestination("");
      setVehicleId("");
      setDriverId("");
      setCargoWeight("");
      setPlannedDist("");
      void refetchTrips();
      // Also refresh dispatch pool & available drivers after creating a trip
      void fetchDynamicAssets();
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
      void fetchDynamicAssets();
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
      void fetchDynamicAssets();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel trip");
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (completingTripId === null) return;
    setCompleteError(null);

    const odoNumErr = validators.positiveNumber(finalOdo, "Final Odometer");
    const fuelErr = validators.positiveNumber(fuelConsumed, "Fuel Consumed");
    const costErr = fuelCost && parseFloat(fuelCost) < 0 ? "Fuel cost cannot be negative" : null;

    setFinalOdoError(odoNumErr);
    setFuelConsumedError(fuelErr);
    setFuelCostError(costErr);

    if (odoNumErr || fuelErr || costErr) return;

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
        fuel_cost: parseFloat(fuelCost || "0"),
      });
      setCompletingTripId(null);
      setFinalOdo("");
      setFuelConsumed("");
      setFuelCost("");
      void refetchTrips();
      void fetchDynamicAssets();
    } catch (err) {
      setCompleteError(err instanceof Error ? err.message : "Failed to complete trip");
    } finally {
      setCompleting(false);
    }
  };

  const stats = useMemo(() => {
    const list = trips || [];
    const totalCount = list.length;
    const completed = list.filter(t => t.status === "Completed").length;
    const dispatched = list.filter(t => t.status === "Dispatched").length;
    const draft = list.filter(t => t.status === "Draft").length;
    const cancelled = list.filter(t => t.status === "Cancelled").length;
    
    // total cargo weight currently in transit
    const activeCargo = list
      .filter(t => t.status === "Dispatched")
      .reduce((sum, t) => sum + t.cargo_weight, 0);

    return { totalCount, completed, dispatched, draft, cancelled, activeCargo };
  }, [trips]);

  const totalTripsForPct = stats.totalCount || 1;
  const draftPct = (stats.draft / totalTripsForPct) * 100;
  const dispatchedPct = (stats.dispatched / totalTripsForPct) * 100;
  const completedPct = (stats.completed / totalTripsForPct) * 100;
  const cancelledPct = (stats.cancelled / totalTripsForPct) * 100;

  return (
    <>
      <div className="page-header">
        <h2>{chrome.title}</h2>
        <p className="text-muted">{chrome.sub}</p>
      </div>

      {/* Metrics Summary Card with Visualization Chart */}
      <div style={{ marginBottom: "24px" }}>
        <Card style={{ padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "0.72rem", letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>
            Trip Dispatch Metrics
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>Active Dispatches</span>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>{stats.dispatched}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>Draft / Scheduled</span>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>{stats.draft}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>Cargo In Transit</span>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>{stats.activeCargo.toLocaleString()} kg</div>
            </div>
            <div>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>Total Managed</span>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>{stats.totalCount}</div>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--color-muted)", marginBottom: "6px" }}>
              <span>STATUS DISTRIBUTION</span>
              <span>{stats.completed} Completed · {stats.dispatched} Dispatched · {stats.draft} Draft · {stats.cancelled} Cancelled</span>
            </div>
            <div style={{
              display: "flex",
              height: "10px",
              borderRadius: "99px",
              overflow: "hidden",
              background: "var(--color-surface-2)",
            }}>
              {stats.completed > 0 && (
                <div style={{ width: `${completedPct}%`, background: "var(--color-success, #22c55e)", transition: "width 0.5s" }} title={`Completed: ${stats.completed}`} />
              )}
              {stats.dispatched > 0 && (
                <div style={{ width: `${dispatchedPct}%`, background: "var(--color-info, #3b82f6)", transition: "width 0.5s" }} title={`Dispatched: ${stats.dispatched}`} />
              )}
              {stats.draft > 0 && (
                <div style={{ width: `${draftPct}%`, background: "var(--color-muted)", transition: "width 0.5s" }} title={`Draft: ${stats.draft}`} />
              )}
              {stats.cancelled > 0 && (
                <div style={{ width: `${cancelledPct}%`, background: "var(--color-danger, #ef4444)", transition: "width 0.5s" }} title={`Cancelled: ${stats.cancelled}`} />
              )}
            </div>
            {stats.totalCount === 0 && (
              <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontStyle: "italic", marginTop: "4px" }}>No trips on board to calculate status distribution.</div>
            )}
          </div>
        </Card>
      </div>

      <div className="split-pane-layout">
        {/* Left: Create Trip / Lifecycle */}
        <div className="split-pane-side" style={{ flex: 1.2 }}>
          {allowSchedule ? (
            <Card style={{ padding: "var(--space-4)" }}>
              {/* Trip lifecycle stepper */}
              <h3 style={{ margin: "0 0 var(--space-3)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-muted)" }}>
                TRIP LIFECYCLE
              </h3>
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                position: "relative",
                paddingBottom: "var(--space-4)",
                marginBottom: "var(--space-3)",
              }}>
                {/* Connector line */}
                <div style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  right: "10px",
                  height: "2px",
                  background: "var(--color-border)",
                  zIndex: 1,
                }} />
                {[
                  { label: "Draft", color: "var(--color-success, #22c55e)" },
                  { label: "Dispatched", color: "var(--color-info, #3b82f6)" },
                  { label: "Completed", color: "var(--color-border)" },
                  { label: "Cancelled", color: "var(--color-border)" },
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 2 }}>
                    <div style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: i < 2 ? step.color : "var(--color-surface)",
                      border: `2px solid ${i < 2 ? step.color : "var(--color-border)"}`,
                    }} />
                    <span style={{
                      fontSize: "0.68rem",
                      fontWeight: i < 2 ? 700 : 400,
                      color: i < 2 ? step.color : "var(--color-muted)",
                      whiteSpace: "nowrap",
                    }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: "var(--space-4)" }} />

              <h3 style={{ margin: "0 0 var(--space-3)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-muted)" }}>
                CREATE TRIP
              </h3>

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
                      onChange={(e) => { setSource(e.target.value); if (sourceError) setSourceError(null); }}
                    />
                    <TextField
                      id="destination"
                      label="DESTINATION"
                      required
                      placeholder="Ahmedabad Hub"
                      value={destination}
                      error={destinationError}
                      onChange={(e) => { setDestination(e.target.value); if (destinationError) setDestinationError(null); }}
                    />
                    <SelectField
                      id="vehicle"
                      label="VEHICLE (AVAILABLE ONLY)"
                      required
                      options={dispatchPool.map(v => ({
                        value: String(v.id),
                        label: `${v.registration_number} — ${v.max_load_kg} kg capacity`,
                      }))}
                      placeholder={dispatchPool.length ? "-- Select Vehicle --" : "-- No vehicles in dispatch pool --"}
                      value={vehicleId}
                      error={vehicleIdError}
                      onChange={(e) => { setVehicleId(e.target.value); if (vehicleIdError) setVehicleIdError(null); }}
                    />
                    <SelectField
                      id="driver"
                      label="DRIVER (AVAILABLE ONLY)"
                      required
                      options={availableDrivers.map(d => ({
                        value: String(d.id),
                        label: d.name,
                      }))}
                      placeholder={availableDrivers.length ? "-- Select Driver --" : "-- No available drivers --"}
                      value={driverId}
                      error={driverIdError}
                      onChange={(e) => { setDriverId(e.target.value); if (driverIdError) setDriverIdError(null); }}
                    />
                    <NumberField
                      id="cargo"
                      label="CARGO WEIGHT (KG)"
                      required
                      min={1}
                      value={cargoWeight}
                      error={cargoWeightError}
                      onChange={(e) => { setCargoWeight(e.target.value); if (cargoWeightError) setCargoWeightError(null); }}
                    />
                    <NumberField
                      id="distance"
                      label="PLANNED DISTANCE (KM)"
                      min={1}
                      value={plannedDist}
                      error={plannedDistError}
                      onChange={(e) => { setPlannedDist(e.target.value); if (plannedDistError) setPlannedDistError(null); }}
                    />
                  </div>

                  {isOverweight && (
                    <div className="warning-error-box">
                      <p className="warning-error-title">Vehicle Capacity: {capacityLimit} kg</p>
                      <p className="warning-error-desc">Cargo Weight: {cargoWeightVal} kg</p>
                      <p className="warning-error-detail">
                        <span>&#10006;</span> Capacity exceeded by {exceededWeight} kg — dispatch blocked
                      </p>
                    </div>
                  )}

                  {formError && <p className="error" style={{ marginBottom: "var(--space-3)" }}>{formError}</p>}

                  <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
                    <Button
                      type="submit"
                      disabled={submitting || !!isOverweight}
                      style={{
                        flex: 1,
                        background: isOverweight ? "var(--color-surface)" : "var(--color-accent)",
                        borderColor: isOverweight ? "var(--color-border)" : "var(--color-accent)",
                        color: isOverweight ? "var(--color-muted)" : "#000",
                        fontWeight: 700,
                      }}
                    >
                      {isOverweight ? "Dispatch disabled" : submitting ? "Creating..." : "Create Draft"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSource(""); setDestination(""); setVehicleId("");
                        setDriverId(""); setCargoWeight(""); setPlannedDist("");
                        setFormError(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          ) : (
            <Card style={{ padding: "var(--space-4)" }}>
              <h3 style={{ margin: 0 }}>Trip Dispatch</h3>
              <p className="text-muted">Your role can view the live board but cannot schedule trips.</p>
            </Card>
          )}
        </div>

        {/* Right: Live Board */}
        <div className="split-pane-main">
          <Card style={{ padding: "var(--space-4)" }}>
            <h3 style={{ margin: "0 0 var(--space-4)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-muted)" }}>
              LIVE BOARD
            </h3>

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

                  const etaLabel = t.status === "Dispatched" ? "In transit"
                    : t.status === "Draft" ? "Awaiting dispatch"
                    : t.status === "Cancelled" ? "Cancelled"
                    : "Completed";

                  const tripCode = `TR${String(t.id).padStart(3, "0")}`;
                  const sc = STATUS_COLORS[t.status] ?? STATUS_COLORS["Draft"];

                  return (
                    <div key={t.id} className="trip-live-card" style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "10px",
                      gap: "16px",
                      marginBottom: "12px",
                    }}>
                      {/* Left column */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <strong style={{ fontSize: "0.9375rem" }}>{tripCode}</strong>
                          <span style={{
                            padding: "2px 10px",
                            borderRadius: "20px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            background: sc.bg,
                            color: sc.text,
                          }}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.source} &rarr; {t.destination}
                        </p>
                        <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>
                          {vehicle ? vehicle.registration_number : `V#${t.vehicle_id}`} &nbsp;·&nbsp; {driver ? driver.name : "Unassigned"}
                        </span>
                      </div>

                      {/* Right column */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>{etaLabel}</span>

                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {t.status === "Draft" && allowDispatch && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                              <Button
                                style={{ padding: "3px 10px", fontSize: "0.78rem" }}
                                onClick={() => void handleDispatch(t.id)}
                                disabled={!assetsReady}
                              >
                                Dispatch
                              </Button>
                              {dispatchError[t.id] && (
                                <p className="error" style={{ fontSize: "0.7rem", margin: "2px 0 0", maxWidth: "120px", textAlign: "right" }}>
                                  {dispatchError[t.id]}
                                </p>
                              )}
                            </div>
                          )}
                          {(t.status === "Draft" || t.status === "Dispatched") && allowSchedule && (
                            <div style={{ display: "flex", gap: "4px" }}>
                              {t.status === "Dispatched" && (
                                <Button
                                  style={{ padding: "3px 10px", fontSize: "0.78rem", background: "var(--color-success, #22c55e)", color: "#000", border: "none" }}
                                  onClick={() => setCompletingTripId(t.id)}
                                >
                                  Complete
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                style={{ padding: "3px 10px", fontSize: "0.78rem", border: "1px solid var(--color-danger, #ef4444)", color: "var(--color-danger, #ef4444)" }}
                                onClick={() => void handleCancel(t.id)}
                              >
                                Cancel
                              </Button>
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

            <p style={{
              marginTop: "var(--space-4)",
              fontSize: "0.78rem",
              color: "var(--color-muted)",
              fontStyle: "italic",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "var(--space-2)",
            }}>
              On Complete: odometer &rarr; fuel log &rarr; expenses &rarr; Vehicle &amp; Driver status reset to Available
            </p>
          </Card>
        </div>
      </div>

      {/* Complete Trip Modal */}
      {completingTripId !== null && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "var(--space-4)",
        }}>
          <Card style={{ width: "100%", maxWidth: "440px" }}>
            <h3 style={{ margin: "0 0 var(--space-3)", fontSize: "0.95rem", letterSpacing: "0.05em" }}>
              COMPLETE TRIP #{completingTripId}
            </h3>
            <form onSubmit={(e) => void handleCompleteSubmit(e)}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                <NumberField
                  id="finalOdo"
                  label="Final Odometer Reading (km)"
                  required
                  min={0}
                  value={finalOdo}
                  error={finalOdoError}
                  onChange={(e) => { setFinalOdo(e.target.value); if (finalOdoError) setFinalOdoError(null); }}
                />
                <NumberField
                  id="fuelConsumed"
                  label="Fuel Consumed (Litres)"
                  required
                  min={0}
                  step="0.01"
                  value={fuelConsumed}
                  error={fuelConsumedError}
                  onChange={(e) => { setFuelConsumed(e.target.value); if (fuelConsumedError) setFuelConsumedError(null); }}
                />
                <NumberField
                  id="fuelCost"
                  label="Total Fuel Cost (₹)"
                  min={0}
                  step="0.01"
                  value={fuelCost}
                  error={fuelCostError}
                  onChange={(e) => { setFuelCost(e.target.value); if (fuelCostError) setFuelCostError(null); }}
                />
              </div>
              {completeError && <p className="error" style={{ marginBottom: "var(--space-3)" }}>{completeError}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                <Button type="button" variant="ghost" onClick={() => setCompletingTripId(null)}>Cancel</Button>
                <Button
                  type="submit"
                  disabled={completing}
                  style={{ background: "var(--color-success, #22c55e)", color: "#000", border: "none" }}
                >
                  {completing ? "Completing..." : "Complete & Log"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
