import { useState, useEffect, useRef } from "react";
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

  // Only fetch assets once on mount
  useEffect(() => {
    if (!assetsFetched.current) {
      assetsFetched.current = true;
      void fetchAssets();
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
      void fetchAssets();
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
      void fetchAssets();
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
      void fetchAssets();
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
      void fetchAssets();
    } catch (err) {
      setCompleteError(err instanceof Error ? err.message : "Failed to complete trip");
    } finally {
      setCompleting(false);
    }
  };

  // Visual stats computation
  const tripList = trips ?? [];
  const totalTrips = tripList.length;
  const draftCount = tripList.filter(t => t.status === "Draft").length;
  const dispatchedCount = tripList.filter(t => t.status === "Dispatched").length;
  const completedCount = tripList.filter(t => t.status === "Completed").length;
  const cancelledCount = tripList.filter(t => t.status === "Cancelled").length;

  const draftPct = totalTrips > 0 ? (draftCount / totalTrips) * 100 : 0;
  const dispatchedPct = totalTrips > 0 ? (dispatchedCount / totalTrips) * 100 : 0;
  const completedPct = totalTrips > 0 ? (completedCount / totalTrips) * 100 : 0;
  const cancelledPct = totalTrips > 0 ? (cancelledCount / totalTrips) * 100 : 0;

  return (
    <div className="trips-page-container">
      <div className="page-header" style={{ flexShrink: 0 }}>
        <h2>{chrome.title}</h2>
        <p className="text-muted">{chrome.sub}</p>
      </div>

      {/* Visual Analytics Dashboard */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px", flexShrink: 0 }}>
        {/* Trip Operations Status Distribution */}
        <Card style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Trip Status Breakdown
            </span>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text)" }}>
              {totalTrips} Total
            </span>
          </div>

          <div style={{ display: "flex", height: "8px", borderRadius: "99px", overflow: "hidden", background: "var(--color-surface-2)" }}>
            {draftCount > 0 && <div style={{ width: `${draftPct}%`, background: "var(--color-muted-2)", transition: "width 0.5s" }} />}
            {dispatchedCount > 0 && <div style={{ width: `${dispatchedPct}%`, background: "#3b82f6", transition: "width 0.5s" }} />}
            {completedCount > 0 && <div style={{ width: `${completedPct}%`, background: "#22c55e", transition: "width 0.5s" }} />}
            {cancelledCount > 0 && <div style={{ width: `${cancelledPct}%`, background: "#ef4444", transition: "width 0.5s" }} />}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "0.72rem", fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-muted-2)" }} />
              <span style={{ color: "var(--color-text)" }}>Draft ({draftCount})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" }} />
              <span style={{ color: "var(--color-text)" }}>Dispatched ({dispatchedCount})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ color: "var(--color-text)" }}>Completed ({completedCount})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }} />
              <span style={{ color: "var(--color-text)" }}>Cancelled ({cancelledCount})</span>
            </div>
          </div>
        </Card>

        {/* Dispatch Pool Availability (Resources) */}
        <Card style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Dispatch Resource Pool
          </span>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", fontWeight: 600 }}>
                <span style={{ color: "var(--color-muted)" }}>Vehicles</span>
                <span style={{ color: "var(--color-text)" }}>{dispatchPool.length}/{allVehicles.length}</span>
              </div>
              <div style={{ height: "5px", borderRadius: "99px", background: "var(--color-surface-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${allVehicles.length > 0 ? (dispatchPool.length / allVehicles.length) * 100 : 0}%`, background: "#10b981", borderRadius: "99px", transition: "width 0.5s" }} />
              </div>
              <span style={{ fontSize: "0.62rem", color: "var(--color-muted-2)", fontWeight: 500 }}>Ready / Standby</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", fontWeight: 600 }}>
                <span style={{ color: "var(--color-muted)" }}>Drivers</span>
                <span style={{ color: "var(--color-text)" }}>{availableDrivers.length}/{allDrivers.length}</span>
              </div>
              <div style={{ height: "5px", borderRadius: "99px", background: "var(--color-surface-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${allDrivers.length > 0 ? (availableDrivers.length / allDrivers.length) * 100 : 0}%`, background: "#3b82f6", borderRadius: "99px", transition: "width 0.5s" }} />
              </div>
              <span style={{ fontSize: "0.62rem", color: "var(--color-muted-2)", fontWeight: 500 }}>On Duty / Idle</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="trips-split-layout">
        {/* Left Column: Live Board */}
        <div className="trips-pane-left">
          <Card style={{ padding: "var(--space-4)" }}>
            <h3 style={{ margin: "0 0 var(--space-4)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>
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

                  const etaLabel = t.status === "Dispatched" ? "In Transit"
                    : t.status === "Draft" ? "Awaiting Dispatch"
                    : t.status === "Cancelled" ? "Cancelled"
                    : "Completed";

                  const tripCode = `TR${String(t.id).padStart(3, "0")}`;
                  const sc = STATUS_COLORS[t.status] ?? STATUS_COLORS["Draft"];

                  const isCompleted = t.status === "Completed";
                  const isDispatched = t.status === "Dispatched";
                  const isCancelled = t.status === "Cancelled";
                  let progressPct = 0;
                  if (isDispatched) progressPct = 50;
                  else if (isCompleted) progressPct = 100;

                  return (
                    <div key={t.id} className="trip-live-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "0.95rem", letterSpacing: "-0.01em", color: "var(--color-text)" }}>{tripCode}</strong>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "20px",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            background: sc.bg,
                            color: sc.text,
                          }}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "var(--color-muted)", fontWeight: 600 }}>{etaLabel}</span>
                      </div>

                      <div style={{ padding: "12px 0 20px", position: "relative" }}>
                        <div style={{
                          height: "3px",
                          borderRadius: "2px",
                          background: isCancelled ? "rgba(239, 68, 68, 0.15)" : "var(--color-surface-2)",
                          position: "relative",
                          margin: "0 10px"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${progressPct}%`,
                            background: isCompleted ? "#22c55e" : "#3b82f6",
                            borderRadius: "2px",
                            transition: "width 0.5s ease"
                          }} />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "-8px", padding: "0 4px" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                            <span style={{
                              width: "10px", height: "10px", borderRadius: "50%",
                              background: isCancelled ? "#ef4444" : "#3b82f6",
                              border: "2px solid var(--color-bg)",
                              boxShadow: "0 0 0 1px var(--color-border)",
                              zIndex: 2
                            }} />
                            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--color-text)" }}>{t.source}</span>
                            <span style={{ fontSize: "0.62rem", color: "var(--color-muted-2)" }}>Origin</span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                            <span style={{
                              width: "10px", height: "10px", borderRadius: "50%",
                              background: isCompleted ? "#22c55e" : "var(--color-muted-2)",
                              border: "2px solid var(--color-bg)",
                              boxShadow: "0 0 0 1px var(--color-border)",
                              zIndex: 2
                            }} />
                            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--color-text)" }}>{t.destination}</span>
                            <span style={{ fontSize: "0.62rem", color: "var(--color-muted-2)" }}>Destination</span>
                          </div>
                        </div>

                        {!isCancelled && (
                          <div style={{
                            position: "absolute",
                            top: "-2px",
                            left: `calc(${progressPct}% - 9px)`,
                            transition: "left 0.5s ease",
                            zIndex: 3,
                            background: "var(--color-bg)",
                            border: `1.5px solid ${isCompleted ? "#22c55e" : "#3b82f6"}`,
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "var(--shadow-soft)"
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isCompleted ? "#22c55e" : "#3b82f6"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1" y="3" width="15" height="13"/>
                              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                              <circle cx="5.5" cy="18.5" r="2.5"/>
                              <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                          </div>
                        )}

                        {isCancelled && (
                          <div style={{
                            position: "absolute",
                            top: "6px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "var(--color-danger-bg)",
                            border: "1px solid var(--color-danger)",
                            color: "var(--color-danger)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            zIndex: 3
                          }}>
                            Cancelled
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", padding: "10px 0 0", borderTop: "1px solid var(--color-border)" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vehicle</span>
                          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text)" }}>{vehicle ? vehicle.registration_number : `V#${t.vehicle_id}`}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Driver</span>
                          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text)" }}>{driver ? driver.name : "Unassigned"}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cargo Weight</span>
                          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text)" }}>{t.cargo_weight} kg</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Distance</span>
                          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text)" }}>{t.planned_distance} km</span>
                        </div>

                        <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", marginLeft: "auto", flexWrap: "wrap", paddingTop: "4px" }}>
                          {t.status === "Draft" && allowDispatch && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                              <Button
                                style={{ padding: "4px 12px", fontSize: "0.78rem" }}
                                onClick={() => void handleDispatch(t.id)}
                                disabled={!assetsReady}
                              >
                                Dispatch
                              </Button>
                              {dispatchError[t.id] && (
                                <p className="error" style={{ fontSize: "0.68rem", margin: "2px 0 0", maxWidth: "120px", textAlign: "right" }}>
                                  {dispatchError[t.id]}
                                </p>
                              )}
                            </div>
                          )}
                          {(t.status === "Draft" || t.status === "Dispatched") && allowSchedule && (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <Button
                                style={{ padding: "4px 12px", fontSize: "0.78rem", background: "var(--color-success, #22c55e)", color: "#000", border: "none" }}
                                onClick={() => setCompletingTripId(t.id)}
                              >
                                Complete
                              </Button>
                              {allowDispatch && (
                                <Button
                                  variant="ghost"
                                  style={{ padding: "4px 12px", fontSize: "0.78rem", border: "1px solid var(--color-danger, #ef4444)", color: "var(--color-danger, #ef4444)" }}
                                  onClick={() => void handleCancel(t.id)}
                                >
                                  Cancel
                                </Button>
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

            <p style={{
              marginTop: "var(--space-4)",
              fontSize: "0.72rem",
              color: "var(--color-muted)",
              fontStyle: "italic",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "var(--space-2)",
            }}>
              On Complete: odometer &rarr; fuel log &rarr; expenses &rarr; Vehicle &amp; Driver status reset to Available
            </p>
          </Card>
        </div>

        {/* Right Column: Create Trip / Lifecycle */}
        <div className="trips-pane-right">
          {allowSchedule ? (
            <Card style={{ padding: "var(--space-4)" }}>
              <h3 style={{ margin: "0 0 var(--space-3)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>
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
                  { label: "Draft", color: "#94a3b8" },
                  { label: "Dispatched", color: "#3b82f6" },
                  { label: "Completed", color: "#22c55e" },
                  { label: "Cancelled", color: "#ef4444" },
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 2 }}>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "var(--color-surface)",
                      border: `3px solid ${step.color}`,
                    }} />
                    <span style={{
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      color: step.color,
                      whiteSpace: "nowrap",
                    }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: "var(--space-4)" }} />

              <h3 style={{ margin: "0 0 var(--space-3)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>
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

                    {selectedVehicle && (
                      <div style={{
                        padding: "8px 10px", background: "var(--color-surface-2)",
                        borderRadius: "8px", border: "1px solid var(--color-border)",
                        fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "6px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                          <span style={{ color: "var(--color-muted)" }}>Load Capacity Usage:</span>
                          <span style={{ color: isOverweight ? "var(--color-danger)" : "var(--color-success)" }}>
                            {cargoWeightVal} / {capacityLimit} kg ({((cargoWeightVal / capacityLimit) * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <div style={{ height: "4px", borderRadius: "2px", background: "var(--color-border)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: `${Math.min((cargoWeightVal / capacityLimit) * 100, 100)}%`,
                            background: isOverweight ? "#ef4444" : "#22c55e",
                            borderRadius: "2px",
                            transition: "width 0.3s ease"
                          }} />
                        </div>
                      </div>
                    )}

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
                    <div className="warning-error-box" style={{ marginTop: "12px" }}>
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
      </div>

      {/* Complete Trip Modal */}
      {completingTripId !== null && (
        <div className="modal-overlay">
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
    </div>
  );
}
