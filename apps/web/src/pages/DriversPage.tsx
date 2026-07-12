import { useState } from "react";
import { Card, Spinner, Button, Pagination } from "../components/ui";
import { TextField, NumberField, DateField } from "../components/forms";
import * as validators from "../lib/validators";
import { useApiList } from "../hooks/useApiList";
import { useAuth } from "../hooks/useAuth";
import { endpoints, apiPost } from "../lib/api";
import { canManageDrivers } from "../lib/rbac";
import type { Driver } from "../types";

const PAGE_SIZE = 25;

export default function DriversPage() {
  const { user } = useAuth();
  const allowAdd = canManageDrivers(user);
  const [offset, setOffset] = useState(0);
  const { data: drivers, total, error, loading, apiMissing, refetch } = useApiList<Driver>(
    endpoints.drivers,
    { limit: PAGE_SIZE, offset },
  );

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
      // Refetch
      void refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add driver");
    } finally {
      setSubmitting(false);
    }
  };

  const isExpired = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry < today;
  };

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Drivers & Safety</h2>
          <p className="text-muted">Manage driver registry, license expiration dates, and safety performance indices</p>
        </div>
        {allowAdd && <Button onClick={() => setIsAdding(true)}>Add Driver</Button>}
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
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Name</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>License Number</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Category</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>License Expiry</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Contact</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Safety Score</th>
                  <th style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => {
                  const expired = isExpired(d.license_expiry);
                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "var(--space-2)", fontWeight: "bold" }}>{d.name}</td>
                      <td style={{ padding: "var(--space-2)" }}>{d.license_number}</td>
                      <td style={{ padding: "var(--space-2)" }}>{d.license_category}</td>
                      <td style={{ padding: "var(--space-2)", color: expired ? "var(--color-error)" : "inherit" }}>
                        {d.license_expiry} {expired && <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>(EXPIRED)</span>}
                      </td>
                      <td style={{ padding: "var(--space-2)", color: "var(--color-muted)" }}>{d.contact_number ?? "—"}</td>
                      <td style={{ padding: "var(--space-2)" }}>
                        <span style={{
                          color: d.safety_score >= 85 ? "#28a745" : d.safety_score >= 70 ? "orange" : "var(--color-error)",
                          fontWeight: "bold"
                        }}>
                          {d.safety_score} / 100
                        </span>
                      </td>
                      <td style={{ padding: "var(--space-2)" }}>
                        <span style={{
                          padding: "2px 8px",
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
                                 "#6c757d"
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
