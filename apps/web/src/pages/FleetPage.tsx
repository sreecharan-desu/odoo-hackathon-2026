import { useEffect, useState } from "react";
import { Card, Spinner, Button, Pagination } from "../components/ui";
import { TextField, NumberField, SelectField } from "../components/forms";
import * as validators from "../lib/validators";
import { useAuth } from "../hooks/useAuth";
import { useApiList } from "../hooks/useApiList";
import { API_BASE_URL } from "../constants";
import { endpoints, apiGet, apiPost } from "../lib/api";
import { canManageFleet, pageChrome } from "../lib/rbac";
import { formatInr } from "../constants";
import type { Vehicle, VehicleDocument } from "../types";
import "../components/layout/shell.css";

const PAGE_SIZE = 50;

export default function FleetPage() {
  const { user } = useAuth();
  const allowAdd = canManageFleet(user);
  const chrome = pageChrome(user, "fleet");
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

  // Table filters
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchReg, setSearchReg] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [docType, setDocType] = useState("Registration");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [docSubmitting, setDocSubmitting] = useState(false);

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

  // Filter logic
  const filteredVehicles = (vehicles || []).filter(v => {
    const matchesType = typeFilter === "All" || v.vehicle_type === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    const matchesSearch = !searchReg || v.registration_number.toLowerCase().includes(searchReg.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const loadDocuments = async (vehicleId: number) => {
    try {
      const rows = await apiGet<VehicleDocument[]>(`${endpoints.vehicles}/${vehicleId}/documents`);
      setDocuments(rows);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  useEffect(() => {
    if (selectedVehicleId !== null) {
      void loadDocuments(selectedVehicleId);
    } else {
      setDocuments([]);
    }
  }, [selectedVehicleId]);

  const uploadDocument = async () => {
    if (selectedVehicleId === null || !docFile) {
      setDocError("Select a vehicle and file first");
      return;
    }
    setDocError(null);
    setDocSubmitting(true);
    try {
      const rawToken = sessionStorage.getItem("transitops_auth");
      const token = rawToken ? JSON.parse(rawToken).token : null;
      const formData = new FormData();
      formData.append("doc_type", docType);
      formData.append("file", docFile);
      const response = await fetch(`${API_BASE_URL}${endpoints.vehicles}/${selectedVehicleId}/documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) throw new Error("Document upload failed");
      setDocFile(null);
      await loadDocuments(selectedVehicleId);
    } catch (err) {
      setDocError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setDocSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>{chrome.title}</h2>
          <p className="text-muted">{chrome.sub}</p>
        </div>
        {allowAdd && (
          <Button onClick={() => setIsAdding(true)} style={{ background: "#f0a500", borderColor: "#f0a500", color: "#000", fontWeight: 700 }}>+ Add Vehicle</Button>
        )}
      </div>

      {/* Top Filter Bar */}
      <div className="dashboard-filters" style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginBottom: "var(--space-3)" }}>
        <select
          className="dashboard-filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">Type: All</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
        </select>
        <select
          className="dashboard-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>
        <input
          type="text"
          placeholder="Search reg. no..."
          className="shell-header-search"
          style={{ height: "28px", padding: "4px 8px", width: "180px" }}
          value={searchReg}
          onChange={(e) => setSearchReg(e.target.value)}
        />
      </div>

      <Card>
        {loading && <Spinner />}
        {apiMissing && (
          <p className="page-empty">Fleet API not available yet. List will appear here.</p>
        )}
        {error && <p className="error">{error}</p>}
        {vehicles && filteredVehicles.length === 0 && (
          <p className="page-empty">No vehicles match the filter criteria.</p>
        )}
        {vehicles && filteredVehicles.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>REG. NO. (UNIQUE)</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>NAME/MODEL</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>TYPE</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>REGION</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>CAPACITY</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>ODOMETER</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>ACQ. COST</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "var(--space-2)" }}>
                      <Button variant="ghost" style={{ padding: "2px 8px" }} onClick={() => setSelectedVehicleId(v.id)}>
                        Docs
                      </Button>
                    </td>
                    <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>{v.registration_number}</td>
                    <td style={{ padding: "var(--space-2)" }}>{v.name}</td>
                    <td style={{ padding: "var(--space-2)" }}>{v.vehicle_type}</td>
                    <td style={{ padding: "var(--space-2)" }}>{v.region ?? "—"}</td>
                    <td style={{ padding: "var(--space-2)" }}>
                      {v.max_load_kg >= 1000 ? `${(v.max_load_kg / 1000).toFixed(0)} Ton` : `${v.max_load_kg} kg`}
                    </td>
                    <td style={{ padding: "var(--space-2)" }}>{v.odometer.toLocaleString()}</td>
                    <td style={{ padding: "var(--space-2)" }}>{formatInr(v.acquisition_cost)}</td>
                    <td style={{ padding: "var(--space-2)" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: v.status === "Available" ? "rgba(40, 167, 69, 0.15)" :
                                    v.status === "On Trip" ? "rgba(0, 123, 255, 0.15)" :
                                    v.status === "In Shop" ? "rgba(255, 193, 7, 0.15)" :
                                    "rgba(220, 53, 69, 0.15)",
                        color: v.status === "Available" ? "#28a745" :
                               v.status === "On Trip" ? "#007bff" :
                               v.status === "In Shop" ? "#ffc107" :
                               "#dc3545",
                        display: "inline-block",
                        textAlign: "center",
                        minWidth: "75px"
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

      {selectedVehicleId !== null && (
        <Card style={{ marginTop: "var(--space-4)" }}>
          <h3 style={{ margin: "0 0 var(--space-2)" }}>Vehicle Documents</h3>
          <p className="text-muted" style={{ marginTop: 0 }}>
            Selected vehicle ID: {selectedVehicleId}
          </p>
          <div style={{ display: "grid", gap: "var(--space-2)", gridTemplateColumns: "1fr auto" }}>
            <SelectField
              id="docType"
              label="Document Type"
              options={[
                { value: "Registration", label: "Registration" },
                { value: "Insurance", label: "Insurance" },
                { value: "Permit", label: "Permit" },
                { value: "Fitness", label: "Fitness" },
                { value: "Other", label: "Other" },
              ]}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            />
            <div style={{ display: "flex", alignItems: "end", gap: "8px" }}>
              <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
              <Button onClick={() => void uploadDocument()} disabled={docSubmitting}>
                Upload
              </Button>
            </div>
          </div>
          {docError && <p className="error">{docError}</p>}
          <div style={{ marginTop: "var(--space-3)", display: "flex", flexDirection: "column", gap: "8px" }}>
            {documents.length === 0 ? (
              <p className="page-empty">No documents uploaded yet.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span>{doc.doc_type}</span>
                  <span style={{ color: "var(--color-muted)" }}>{doc.file_name}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

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
                    label="Acquisition Cost (₹)"
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
