import { useState } from "react";
import { Card, Spinner, Button, Pagination } from "../components/ui";
import { TextField, NumberField, DateField } from "../components/forms";
import * as validators from "../lib/validators";
import { useAuth } from "../hooks/useAuth";
import { useApiList } from "../hooks/useApiList";
import { endpoints, apiPost, apiPatch } from "../lib/api";
import { canManageDrivers, pageChrome } from "../lib/rbac";
import type { Driver } from "../types";
import "../components/layout/shell.css";

const PAGE_SIZE = 50;

export default function DriversPage() {
  const { user } = useAuth();
  const allowManage = canManageDrivers(user);
  const chrome = pageChrome(user, "drivers");
  const [offset, setOffset] = useState(0);

  const { data: drivers, total, error, loading, apiMissing, refetch } = useApiList<Driver>(
    endpoints.drivers,
    { limit: PAGE_SIZE, offset },
  );

  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [licenseNum, setLicenseNum] = useState("");
  const [licenseCat, setLicenseCat] = useState("LMV");
  const [licenseExp, setLicenseExp] = useState("");
  const [contact, setContact] = useState("");
  const [safetyScore, setSafetyScore] = useState("100");

  // Input validation states
  const [nameError, setNameError] = useState<string | null>(null);
  const [licenseNumError, setLicenseNumError] = useState<string | null>(null);
  const [licenseCatError, setLicenseCatError] = useState<string | null>(null);
  const [licenseExpError, setLicenseExpError] = useState<string | null>(null);
  const [safetyScoreError, setSafetyScoreError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate inputs using Anand's validators
    const nameErr = validators.required(name, "Full Name");
    const licErr = validators.required(licenseNum, "License Number");
    const catErr = validators.required(licenseCat, "Category");
    const expErr = validators.required(licenseExp, "License Expiry");
    const safetyErr = safetyScore ? (parseFloat(safetyScore) < 0 || parseFloat(safetyScore) > 100 ? "Safety score must be between 0 and 100" : null) : null;

    setNameError(nameErr);
    setLicenseNumError(licErr);
    setLicenseCatError(catErr);
    setLicenseExpError(expErr);
    setSafetyScoreError(safetyErr);

    if (nameErr || licErr || catErr || expErr || safetyErr) {
      return;
    }

    setSubmitting(true);
    try {
      await apiPost(endpoints.drivers, {
        name,
        license_number: licenseNum,
        license_category: licenseCat,
        license_expiry: licenseExp,
        contact_number: contact || null,
        safety_score: parseFloat(safetyScore)
      });
      setIsAdding(false);
      // Reset form
      setName("");
      setLicenseNum("");
      setLicenseCat("LMV");
      setLicenseExp("");
      setContact("");
      setSafetyScore("100");
      void refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add driver");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (newStatus: string) => {
    if (selectedDriverId === null) return;
    try {
      await apiPatch(`${endpoints.drivers}/${selectedDriverId}`, { status: newStatus });
      void refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const isExpired = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry < today;
  };

  // Map mock Completion Rate based on Driver name (Mockup 3 compatibility)
  const getCompletionRate = (driverName: string): string => {
    const nameLower = driverName.toLowerCase();
    if (nameLower.includes("alex")) return "96%";
    if (nameLower.includes("john")) return "81%";
    if (nameLower.includes("priya")) return "99%";
    if (nameLower.includes("suresh")) return "88%";
    return "90%";
  };

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>{chrome.title}</h2>
          <p className="text-muted">{chrome.sub}</p>
        </div>
        {allowManage && (
          <Button onClick={() => setIsAdding(true)} style={{ background: "#f0a500", borderColor: "#f0a500", color: "#000", fontWeight: 700 }}>+ Add Driver</Button>
        )}
      </div>

      <Card>
        {loading && <Spinner />}
        {apiMissing && (
          <p className="page-empty">Drivers API not available yet. Roster will appear here.</p>
        )}
        {error && <p className="error">{error}</p>}
        {drivers && drivers.length === 0 && (
          <p className="page-empty">No drivers registered yet.</p>
        )}
        {drivers && drivers.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>DRIVER</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>LICENSE NO.</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>CATEGORY</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>EXPIRY</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>CONTACT</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>TRIP COMPL.</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>SAFETY</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => {
                  const expired = isExpired(d.license_expiry);
                  const isSelected = selectedDriverId === d.id;

                  // Safety badge logic: if license is expired, it's not clear/safe.
                  const isSafetyClear = !expired && d.status !== "Suspended";

                  // Format expiry date as MM/YYYY
                  let expiryLabel = d.license_expiry;
                  try {
                    const parts = d.license_expiry.split("-");
                    if (parts.length === 3) {
                      expiryLabel = `${parts[1]}/${parts[0]}`;
                    }
                  } catch {}

                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDriverId(d.id)}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        cursor: "pointer",
                        background: isSelected ? "rgba(240, 165, 0, 0.08)" : "transparent"
                      }}
                    >
                      <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>{d.name}</td>
                      <td style={{ padding: "var(--space-2)" }}>{d.license_number}</td>
                      <td style={{ padding: "var(--space-2)" }}>{d.license_category}</td>
                      <td style={{ padding: "var(--space-2)", color: expired ? "var(--color-error)" : "inherit" }}>
                        {expiryLabel} {expired && <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--color-error)" }}> EXPIRED</span>}
                      </td>
                      <td style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>{d.contact_number ?? "—"}</td>
                      <td style={{ padding: "var(--space-2)" }}>{getCompletionRate(d.name)}</td>
                      <td style={{ padding: "var(--space-2)" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: isSafetyClear ? "rgba(40, 167, 69, 0.15)" : "rgba(220, 53, 69, 0.15)",
                          color: isSafetyClear ? "#28a745" : "#dc3545"
                        }}>
                          {isSafetyClear ? "Available" : d.status === "Suspended" ? "Suspended" : "Expired"}
                        </span>
                      </td>
                      <td style={{ padding: "var(--space-2)" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: d.status === "Available" ? "rgba(40, 167, 69, 0.15)" :
                                      d.status === "On Trip" ? "rgba(0, 123, 255, 0.15)" :
                                      d.status === "Suspended" ? "rgba(220, 53, 69, 0.15)" :
                                      "rgba(108, 117, 125, 0.15)",
                          color: d.status === "Available" ? "#28a745" :
                                 d.status === "On Trip" ? "#007bff" :
                                 d.status === "Suspended" ? "#dc3545" :
                                 "#6c757d",
                          display: "inline-block",
                          minWidth: "75px",
                          textAlign: "center"
                        }}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {drivers && (
          <Pagination total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
        )}
      </Card>

      {/* Toggle Status Bar */}
      {allowManage && (
      <div className="status-toggle-row">
        <span className="status-toggle-label">Toggle Status</span>
        <Button
          style={{ background: "#28a745", borderColor: "#28a745", padding: "4px 8px", fontSize: "0.8125rem", color: "#fff" }}
          onClick={() => void handleToggleStatus("Available")}
          disabled={selectedDriverId === null}
        >
          Available
        </Button>
        <Button
          style={{ background: "#007bff", borderColor: "#007bff", padding: "4px 8px", fontSize: "0.8125rem", color: "#fff" }}
          onClick={() => void handleToggleStatus("On Trip")}
          disabled={selectedDriverId === null}
        >
          On Trip
        </Button>
        <Button
          style={{ background: "#6c757d", borderColor: "#6c757d", padding: "4px 8px", fontSize: "0.8125rem", color: "#fff" }}
          onClick={() => void handleToggleStatus("Off Duty")}
          disabled={selectedDriverId === null}
        >
          Off Duty
        </Button>
        <Button
          style={{ background: "#dc3545", borderColor: "#dc3545", padding: "4px 8px", fontSize: "0.8125rem", color: "#fff" }}
          onClick={() => void handleToggleStatus("Suspended")}
          disabled={selectedDriverId === null}
        >
          Suspended
        </Button>
        {selectedDriverId === null && (
          <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>(Select a driver from the list to change status)</span>
        )}
      </div>
      )}

      <p className="rule-note-text">
        Rule: Expired license or Suspended status &rarr; blocked from trip assignment
      </p>

      {/* Add Driver Modal */}
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
            <h3 style={{ margin: "0 0 var(--space-3)" }}>Add New Driver</h3>
            <form onSubmit={(e) => void handleAddDriver(e)}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                <TextField
                  id="driverName"
                  label="Full Name *"
                  required
                  value={name}
                  error={nameError}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                />
                <TextField
                  id="licenseNum"
                  label="License Number *"
                  required
                  value={licenseNum}
                  error={licenseNumError}
                  onChange={(e) => {
                    setLicenseNum(e.target.value);
                    if (licenseNumError) setLicenseNumError(null);
                  }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                  <TextField
                    id="licenseCat"
                    label="Category *"
                    required
                    placeholder="e.g. HGV, LMV"
                    value={licenseCat}
                    error={licenseCatError}
                    onChange={(e) => {
                      setLicenseCat(e.target.value);
                      if (licenseCatError) setLicenseCatError(null);
                    }}
                  />
                  <DateField
                    id="licenseExp"
                    label="License Expiry *"
                    required
                    value={licenseExp}
                    error={licenseExpError}
                    onChange={(e) => {
                      setLicenseExp(e.target.value);
                      if (licenseExpError) setLicenseExpError(null);
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                  <TextField
                    id="contact"
                    label="Contact Number"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                  <NumberField
                    id="safetyScore"
                    label="Initial Safety Score (0-100)"
                    min={0}
                    max={100}
                    value={safetyScore}
                    error={safetyScoreError}
                    onChange={(e) => {
                      setSafetyScore(e.target.value);
                      if (safetyScoreError) setSafetyScoreError(null);
                    }}
                  />
                </div>
              </div>
              {formError && <p className="error" style={{ marginBottom: "var(--space-3)" }}>{formError}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Driver"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
