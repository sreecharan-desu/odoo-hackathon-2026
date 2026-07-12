import { useEffect, useState } from "react";
import { Card, Button, Pagination, StatusBadge, Skeleton } from "../components/ui";
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
      {/* Vehicle Registry Visualization Chart */}
      {vehicles && vehicles.length > 0 && (
        <Card style={{ marginBottom: "var(--space-3)", padding: "16px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-around", gap: "24px" }}>
            <div style={{ position: "relative", width: "130px", height: "130px", flexShrink: 0 }}>
              <svg viewBox="0 0 200 200" width="100%" height="100%">
                <circle cx="100" cy="100" r="68" fill="transparent" stroke="var(--color-surface-2)" strokeWidth="22" />
                {(() => {
                  const segs = [
                    { label: "Available", count: (vehicles || []).filter(v => v.status === "Available").length, color: "#10b981" },
                    { label: "On Trip", count: (vehicles || []).filter(v => v.status === "On Trip").length, color: "#3b82f6" },
                    { label: "In Shop", count: (vehicles || []).filter(v => v.status === "In Shop" || v.status === "Maintenance").length, color: "#f59e0b" },
                    { label: "Retired", count: (vehicles || []).filter(v => v.status === "Retired").length, color: "#ef4444" },
                  ];
                  const total = (vehicles || []).length || 1;
                  const r = 68, circ = 2 * Math.PI * r;
                  let acc = 0;
                  return segs.map((seg) => {
                    const pct = seg.count / total;
                    const offset = -acc;
                    acc += pct * circ;
                    if (seg.count === 0) return null;
                    return (
                      <circle key={seg.label} cx="100" cy="100" r={r} fill="transparent"
                        stroke={seg.color} strokeWidth="22"
                        strokeDasharray={`${pct * circ} ${circ}`}
                        strokeDashoffset={offset}
                        transform="rotate(-90 100 100)"
                        style={{ transition: "stroke-dasharray 0.6s ease" }} />
                    );
                  });
                })()}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>{(vehicles || []).length}</span>
                <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-muted)" }}>TOTAL</span>
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px", flex: 1 }}>
              {[
                { label: "Available", count: (vehicles || []).filter(v => v.status === "Available").length, color: "#10b981" },
                { label: "On Trip", count: (vehicles || []).filter(v => v.status === "On Trip").length, color: "#3b82f6" },
                { label: "In Shop", count: (vehicles || []).filter(v => v.status === "In Shop" || v.status === "Maintenance").length, color: "#f59e0b" },
                { label: "Retired", count: (vehicles || []).filter(v => v.status === "Retired").length, color: "#ef4444" },
              ].map((item) => {
                const total = (vehicles || []).length || 1;
                const pct = ((item.count / total) * 100).toFixed(0);
                return (
                  <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "8px 12px", background: "var(--color-surface-2)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-text)" }}>{item.count} <span style={{ fontSize: "0.68rem", color: "var(--color-muted-2)", fontWeight: 500 }}>({pct}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <Card>
        {loading && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "12px 8px" }}><Skeleton width="40%" height={14} /></th>
                  <th style={{ padding: "12px 8px" }}><Skeleton width="30%" height={14} /></th>
                  <th style={{ padding: "12px 8px" }}><Skeleton width="30%" height={14} /></th>
                  <th style={{ padding: "12px 8px" }}><Skeleton width="40%" height={14} /></th>
                  <th style={{ padding: "12px 8px" }}><Skeleton width="20%" height={14} /></th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(i => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "16px 8px" }}><Skeleton width="70%" height={16} /></td>
                    <td style={{ padding: "16px 8px" }}><Skeleton width="50%" height={14} /></td>
                    <td style={{ padding: "16px 8px" }}><Skeleton width="60%" height={14} /></td>
                    <td style={{ padding: "16px 8px" }}><Skeleton width="40%" height={14} /></td>
                    <td style={{ padding: "16px 8px" }}><Skeleton width="30%" height={16} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {apiMissing && (
          <p className="page-empty">Fleet API not available yet. List will appear here.</p>
        )}
        {error && <p className="error">{error}</p>}
        {vehicles && filteredVehicles.length === 0 && (
          <p className="page-empty">No vehicles match the filter criteria.</p>
        )}
        {vehicles && filteredVehicles.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="fleet-table-desktop" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <th style={{ padding: "10px 8px" }}></th>
                    <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>REG. NO.</th>
                    <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>NAME/MODEL</th>
                    <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>TYPE</th>
                    <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>REGION</th>
                    <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>CAPACITY</th>
                    <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>ODOMETER</th>
                    <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>ACQ. COST</th>
                    <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v) => (
                    <tr key={v.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "11px 8px" }}>
                        <Button variant="ghost" style={{ padding: "2px 8px" }} onClick={() => setSelectedVehicleId(v.id)}>
                          Docs
                        </Button>
                      </td>
                      <td style={{ padding: "11px 8px", fontWeight: "bold", fontSize: "0.875rem" }}>{v.registration_number}</td>
                      <td style={{ padding: "11px 8px", fontSize: "0.875rem" }}>{v.name}</td>
                      <td style={{ padding: "11px 8px", fontSize: "0.875rem" }}>{v.vehicle_type}</td>
                      <td style={{ padding: "11px 8px", fontSize: "0.875rem" }}>{v.region ?? "—"}</td>
                      <td style={{ padding: "11px 8px", fontSize: "0.875rem" }}>
                        {v.max_load_kg >= 1000 ? `${(v.max_load_kg / 1000).toFixed(0)} Ton` : `${v.max_load_kg} kg`}
                      </td>
                      <td style={{ padding: "11px 8px", fontSize: "0.875rem" }}>{v.odometer.toLocaleString()}</td>
                      <td style={{ padding: "11px 8px", fontSize: "0.875rem" }}>{formatInr(v.acquisition_cost)}</td>
                      <td style={{ padding: "11px 8px" }}>
                        <StatusBadge status={v.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="fleet-cards-mobile">
              {filteredVehicles.map((v) => (
                <div key={v.id} style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}>
                  {/* Header: reg number + status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontFamily: "monospace", fontSize: "0.95rem", color: "var(--color-text)", letterSpacing: "-0.01em" }}>
                      {v.registration_number}
                    </span>
                    <StatusBadge status={v.status} />
                  </div>
                  {/* Name + type */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text)" }}>{v.name}</span>
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
                      background: "var(--color-border)", color: "var(--color-muted)",
                      padding: "2px 7px", borderRadius: "6px", letterSpacing: "0.06em",
                    }}>{v.vehicle_type}</span>
                  </div>
                  {/* Stats grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Region</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text)" }}>{v.region ?? "—"}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Capacity</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text)" }}>
                        {v.max_load_kg >= 1000 ? `${(v.max_load_kg / 1000).toFixed(0)} Ton` : `${v.max_load_kg} kg`}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Odometer</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text)" }}>{v.odometer.toLocaleString()} km</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Acq. Cost</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text)" }}>{formatInr(v.acquisition_cost)}</span>
                    </div>
                  </div>
                  {/* Docs button */}
                  <Button variant="ghost" style={{ padding: "6px 12px", fontSize: "0.8rem", alignSelf: "flex-start", marginTop: "2px" }} onClick={() => setSelectedVehicleId(v.id)}>
                    📄 View Documents
                  </Button>
                </div>
              ))}
            </div>
          </>
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
        <div className="modal-overlay">
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
