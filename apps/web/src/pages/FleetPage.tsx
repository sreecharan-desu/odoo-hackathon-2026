import { useState } from "react";
import { Card, Spinner, Button, Pagination } from "../components/ui";
import { TextField, NumberField, SelectField } from "../components/forms";
import * as validators from "../lib/validators";
import { useApiList } from "../hooks/useApiList";
import { useAuth } from "../hooks/useAuth";
import { endpoints, apiPost } from "../lib/api";
import { canManageFleet } from "../lib/rbac";
import type { Vehicle } from "../types";

const PAGE_SIZE = 25;

export default function FleetPage() {
  const { user } = useAuth();
  const allowAdd = canManageFleet(user);
  const [offset, setOffset] = useState(0);
  const { data: vehicles, total, error, loading, apiMissing, refetch } = useApiList<Vehicle>(
    endpoints.vehicles,
    { limit: PAGE_SIZE, offset },
  );
  
  const [isAdding, setIsAdding] = useState(false);
  const [regNum, setRegNum] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("Van");
  const [maxLoad, setMaxLoad] = useState("");
  const [odometer, setOdometer] = useState("");
  const [cost, setCost] = useState("");
  const [region, setRegion] = useState("");
  
  // Input validation states
  const [regNumError, setRegNumError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [maxLoadError, setMaxLoadError] = useState<string | null>(null);
  const [odometerError, setOdometerError] = useState<string | null>(null);
  const [costError, setCostError] = useState<string | null>(null);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate inputs using Anand's validators
    const regErr = validators.required(regNum, "Registration Number");
    const nameErr = validators.required(name, "Vehicle Model/Name");
    const loadErr = validators.positiveNumber(maxLoad, "Max Load");
    const odoErr = odometer && parseFloat(odometer) < 0 ? "Odometer cannot be negative" : null;
    const costErr = cost && parseFloat(cost) < 0 ? "Acquisition cost cannot be negative" : null;

    setRegNumError(regErr);
    setNameError(nameErr);
    setMaxLoadError(loadErr);
    setOdometerError(odoErr);
    setCostError(costErr);

    if (regErr || nameErr || loadErr || odoErr || costErr) {
      return;
    }

    setSubmitting(true);
    try {
      await apiPost(endpoints.vehicles, {
        registration_number: regNum,
        name,
        vehicle_type: type,
        max_load_kg: parseFloat(maxLoad),
        odometer: odometer ? parseFloat(odometer) : 0,
        acquisition_cost: cost ? parseFloat(cost) : 0,
        region: region || null
      });
      setIsAdding(false);
      // Reset form
      setRegNum("");
      setName("");
      setType("Van");
      setMaxLoad("");
      setOdometer("");
      setCost("");
      setRegion("");
      // Refetch list
      void refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Vehicle Registry</h2>
          <p className="text-muted">Manage fleet assets, load parameters, and assignment statuses</p>
        </div>
        {allowAdd && <Button onClick={() => setIsAdding(true)}>Add Vehicle</Button>}
      </div>

      <Card>
        {loading && <Spinner />}
        {apiMissing && (
          <p className="page-empty">Fleet API not available yet. List will appear here.</p>
        )}
        {error && <p className="error">{error}</p>}
        {vehicles && vehicles.length === 0 && (
          <p className="page-empty">No vehicles registered yet.</p>
        )}
        {vehicles && vehicles.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Reg Number</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Name</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Type</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Max Load</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Odometer</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Cost</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Region</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>{v.registration_number}</td>
                    <td style={{ padding: "var(--space-2)" }}>{v.name}</td>
                    <td style={{ padding: "var(--space-2)" }}>{v.vehicle_type}</td>
                    <td style={{ padding: "var(--space-2)" }}>{v.max_load_kg} kg</td>
                    <td style={{ padding: "var(--space-2)" }}>{v.odometer} km</td>
                    <td style={{ padding: "var(--space-2)" }}>${v.acquisition_cost.toLocaleString()}</td>
                    <td style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>{v.region ?? "—"}</td>
                    <td style={{ padding: "var(--space-2)" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: v.status === "Available" ? "rgba(40, 167, 69, 0.15)" :
                                    v.status === "On Trip" ? "rgba(0, 123, 255, 0.15)" :
                                    v.status === "In Shop" ? "rgba(220, 53, 69, 0.15)" :
                                    "rgba(108, 117, 125, 0.15)",
                        color: v.status === "Available" ? "#28a745" :
                               v.status === "On Trip" ? "#007bff" :
                               v.status === "In Shop" ? "#dc3545" :
                               "#6c757d"
                      }}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {vehicles && (
          <Pagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
        )}
      </Card>

      {/* Add Vehicle Modal */}
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
          <Card style={{ width: "100%", maxWidth: "500px", position: "relative" }}>
            <h3 style={{ margin: "0 0 var(--space-3)" }}>Add New Vehicle</h3>
            <form onSubmit={(e) => void handleAddVehicle(e)}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                <TextField
                  id="regNum"
                  label="Registration Number *"
                  required
                  value={regNum}
                  error={regNumError}
                  onChange={(e) => {
                    setRegNum(e.target.value);
                    if (regNumError) setRegNumError(null);
                  }}
                />
                <TextField
                  id="name"
                  label="Vehicle Model/Name *"
                  required
                  value={name}
                  error={nameError}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                  <SelectField
                    id="type"
                    label="Type *"
                    required
                    options={[
                      { value: "Van", label: "Van" },
                      { value: "Truck", label: "Truck" },
                      { value: "Sedan", label: "Sedan" },
                      { value: "SUV", label: "SUV" },
                    ]}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  />
                  <NumberField
                    id="maxLoad"
                    label="Max Load (kg) *"
                    required
                    min={1}
                    value={maxLoad}
                    error={maxLoadError}
                    onChange={(e) => {
                      setMaxLoad(e.target.value);
                      if (maxLoadError) setMaxLoadError(null);
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                  <NumberField
                    id="odometer"
                    label="Initial Odometer (km)"
                    min={0}
                    value={odometer}
                    error={odometerError}
                    onChange={(e) => {
                      setOdometer(e.target.value);
                      if (odometerError) setOdometerError(null);
                    }}
                  />
                  <NumberField
                    id="cost"
                    label="Acquisition Cost ($)"
                    min={0}
                    value={cost}
                    error={costError}
                    onChange={(e) => {
                      setCost(e.target.value);
                      if (costError) setCostError(null);
                    }}
                  />
                </div>
                <TextField
                  id="region"
                  label="Operating Region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>
              {formError && <p className="error" style={{ marginBottom: "var(--space-3)" }}>{formError}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Vehicle"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
