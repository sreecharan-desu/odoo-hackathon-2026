import { useState } from "react";
import { Card, Spinner, Button } from "../components/ui";
import { useApiList } from "../hooks/useApiList";
import { endpoints, apiPost } from "../lib/api";
import type { Driver } from "../types";

export default function DriversPage() {
  const { data: drivers, error, loading, apiMissing, refetch } = useApiList<Driver[]>(endpoints.drivers);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [licenseNum, setLicenseNum] = useState("");
  const [licenseCat, setLicenseCat] = useState("LMV");
  const [licenseExp, setLicenseExp] = useState("");
  const [contact, setContact] = useState("");
  const [safetyScore, setSafetyScore] = useState("100");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await apiPost(endpoints.drivers, {
        name,
        license_number: licenseNum,
        license_category: licenseCat,
        license_expiry: licenseExp, // Expected format YYYY-MM-DD
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
        <Button onClick={() => setIsAdding(true)}>Add Driver</Button>
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
                <div>
                  <label htmlFor="driverName" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Full Name *</label>
                  <input
                    id="driverName"
                    type="text"
                    required
                    style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="licenseNum" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>License Number *</label>
                  <input
                    id="licenseNum"
                    type="text"
                    required
                    style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                    value={licenseNum}
                    onChange={(e) => setLicenseNum(e.target.value)}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                  <div>
                    <label htmlFor="licenseCat" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Category *</label>
                    <input
                      id="licenseCat"
                      type="text"
                      required
                      placeholder="e.g. HGV, LMV"
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                      value={licenseCat}
                      onChange={(e) => setLicenseCat(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="licenseExp" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>License Expiry *</label>
                    <input
                      id="licenseExp"
                      type="date"
                      required
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                      value={licenseExp}
                      onChange={(e) => setLicenseExp(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                  <div>
                    <label htmlFor="contact" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Contact Number</label>
                    <input
                      id="contact"
                      type="text"
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="safetyScore" style={{ display: "block", fontSize: "0.875rem", color: "var(--color-muted)", marginBottom: "4px" }}>Initial Safety Score (0-100)</label>
                    <input
                      id="safetyScore"
                      type="number"
                      min="0"
                      max="100"
                      style={{ width: "100%", padding: "var(--space-2)", background: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", color: "var(--color-text)" }}
                      value={safetyScore}
                      onChange={(e) => setSafetyScore(e.target.value)}
                    />
                  </div>
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
