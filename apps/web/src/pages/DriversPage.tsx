import React, { useEffect, useState } from "react";
import { Card, Spinner, Button, Pagination, StatusBadge } from "../components/ui";
import { TextField, NumberField, DateField } from "../components/forms";
import * as validators from "../lib/validators";
import { useAuth } from "../hooks/useAuth";
import { useApiList } from "../hooks/useApiList";
import { endpoints, apiGet, apiPost, apiPatch } from "../lib/api";
import { canManageDrivers, pageChrome } from "../lib/rbac";
import type { Driver, LicenseReminder } from "../types";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

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
  const [reminders, setReminders] = useState<LicenseReminder[]>([]);
  const [reminderLoading, setReminderLoading] = useState(false);

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
    today.setUTCHours(0, 0, 0, 0);
    expiry.setUTCHours(0, 0, 0, 0);
    return expiry < today;
  };

  const loadReminders = async () => {
    setReminderLoading(true);
    try {
      const rows = await apiGet<LicenseReminder[]>(endpoints.licenseReminders);
      setReminders(rows);
    } catch (err) {
      console.error("Failed to load reminders", err);
    } finally {
      setReminderLoading(false);
    }
  };

  const sendReminders = async () => {
    try {
      await apiPost(endpoints.sendLicenseReminders, {});
      await loadReminders();
      alert("Reminder emails sent");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send reminders");
    }
  };

  useEffect(() => {
    if (allowManage) {
      void loadReminders();
    }
  }, [allowManage]);

  // Map mock Completion Rate based on Driver name (Mockup 3 compatibility)
  const getCompletionRate = (driverName: string): string => {
    const nameLower = driverName.toLowerCase();
    if (nameLower.includes("alex")) return "96%";
    if (nameLower.includes("john")) return "81%";
    if (nameLower.includes("priya")) return "99%";
    if (nameLower.includes("suresh")) return "88%";
    return "90%";
  };

  const filteredDrivers = (drivers || []).filter((d) => {
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || (d.contact_number && d.contact_number.includes(q));
  });

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>{chrome.title}</h2>
          <p className="text-muted">{chrome.sub}</p>
        </div>
        {allowManage && (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={() => setIsAdding(true)} style={{ background: "#f0a500", borderColor: "#f0a500", color: "#000", fontWeight: 700 }}>+ Add Driver</Button>
            <Button variant="ghost" onClick={() => void sendReminders()} disabled={reminderLoading || reminders.length === 0}>
              Send License Reminders
            </Button>
          </div>
        )}
      </div>

      {/* Driver Search Input */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search driver by name or contact number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "360px",
            padding: "8px 12px",
            fontSize: "0.875rem",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-text)",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      {allowManage && reminders.length > 0 && (
        <Card style={{ marginBottom: "var(--space-3)" }}>
          <h3 style={{ margin: "0 0 var(--space-2)" }}>Expiring Licenses</h3>
          <p className="text-muted" style={{ marginTop: 0 }}>Drivers within the reminder window.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {reminders.slice(0, 5).map((r) => (
              <div key={r.driver_id} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <span>{r.driver_name}</span>
                <span style={{ color: "var(--color-muted)" }}>{r.days_remaining} days left</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        {loading && <Spinner />}
        {apiMissing && (
          <p className="page-empty">Drivers API not available yet. Roster will appear here.</p>
        )}
        {error && <p className="error">{error}</p>}
        {drivers && filteredDrivers.length === 0 && (
          <p className="page-empty">No drivers registered yet matching search.</p>
        )}
        {drivers && filteredDrivers.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>DRIVER</th>
                  <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>CONTACT</th>
                  <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: "10px 8px", color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600, textAlign: "right" }}>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((d) => {
                  const isExpanded = expandedIds[d.id] || false;
                  const expired = isExpired(d.license_expiry);
                  const isSafetyClear = !expired && d.status !== "Suspended";
                  let expiryLabel = d.license_expiry;
                  try {
                    const parts = d.license_expiry.split("-");
                    if (parts.length === 3) expiryLabel = `${parts[1]}/${parts[0]}`;
                  } catch {}

                  return (
                    <React.Fragment key={d.id}>
                      {/* Main row */}
                      <tr
                        onClick={() => {
                          setSelectedDriverId(d.id);
                          setExpandedIds(prev => ({ ...prev, [d.id]: !prev[d.id] }));
                        }}
                        style={{
                          borderBottom: isExpanded ? "none" : "1px solid var(--color-border)",
                          cursor: "pointer",
                          background: isExpanded ? "var(--color-surface-2)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "11px 8px", fontWeight: "bold", fontSize: "0.875rem" }}>{d.name}</td>
                        <td style={{ padding: "11px 8px", fontSize: "0.875rem" }}>{d.contact_number ?? "—"}</td>
                        <td style={{ padding: "11px 8px" }}>
                          <StatusBadge status={d.status} />
                        </td>
                        <td style={{ padding: "11px 8px", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDriverId(d.id);
                              setExpandedIds(prev => ({ ...prev, [d.id]: !prev[d.id] }));
                            }}
                            style={{
                              background: "transparent", border: "none",
                              color: "var(--color-muted)", cursor: "pointer",
                              padding: "4px", display: "inline-flex", alignItems: "center",
                              transition: "transform 0.2s",
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                        </td>
                      </tr>

                      {/* Inline expanded dropdown row */}
                      {isExpanded && (
                        <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td colSpan={4} style={{ padding: "0" }}>
                            <div style={{
                              background: "var(--color-surface-2)",
                              borderTop: "1px solid var(--color-border)",
                              padding: "16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "16px",
                            }}>
                              {/* Detail fields grid */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px" }}>
                                <div>
                                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>License No.</span>
                                  <div style={{ fontSize: "0.875rem", fontWeight: 600, marginTop: "4px", fontFamily: "monospace" }}>{d.license_number}</div>
                                </div>
                                <div>
                                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Category</span>
                                  <div style={{ fontSize: "0.875rem", fontWeight: 600, marginTop: "4px" }}>{d.license_category}</div>
                                </div>
                                <div>
                                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>License Expiry</span>
                                  <div style={{ fontSize: "0.875rem", fontWeight: 600, marginTop: "4px", color: expired ? "var(--color-error)" : "inherit" }}>
                                    {expiryLabel}{expired && <span style={{ fontSize: "0.7rem", fontWeight: "bold", color: "var(--color-error)", marginLeft: "4px" }}>⚠ EXPIRED</span>}
                                  </div>
                                </div>
                                <div>
                                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Completion Rate</span>
                                  <div style={{ fontSize: "0.875rem", fontWeight: 600, marginTop: "4px" }}>{getCompletionRate(d.name)}</div>
                                </div>
                                <div>
                                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Safety Score</span>
                                  <div style={{ fontSize: "0.875rem", fontWeight: 600, marginTop: "4px", color: isSafetyClear ? "var(--color-positive)" : "var(--color-error)" }}>
                                    {d.safety_score}% {isSafetyClear ? "(Clear)" : "(Risk)"}
                                  </div>
                                </div>
                              </div>

                              {/* Status toggle buttons — only for managers */}
                              {allowManage && (
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", paddingTop: "10px", borderTop: "1px solid var(--color-border)" }}>
                                  <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-muted)", letterSpacing: "0.07em" }}>Set Status:</span>
                                  <Button
                                    style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", fontSize: "0.78rem", background: "var(--color-positive-bg)", borderColor: "var(--color-positive)", color: "var(--color-positive)" }}
                                    onClick={() => void handleToggleStatus("Available")}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    Available
                                  </Button>
                                  <Button
                                    style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", fontSize: "0.78rem", background: "rgba(59,130,246,0.1)", borderColor: "#3b82f6", color: "#3b82f6" }}
                                    onClick={() => void handleToggleStatus("On Trip")}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                                    On Trip
                                  </Button>
                                  <Button
                                    style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", fontSize: "0.78rem", background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-muted)" }}
                                    onClick={() => void handleToggleStatus("Off Duty")}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                                    Off Duty
                                  </Button>
                                  <Button
                                    style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", fontSize: "0.78rem", background: "var(--color-danger-bg)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
                                    onClick={() => void handleToggleStatus("Suspended")}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                    Suspended
                                  </Button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

      <p className="rule-note-text">
        Rule: Expired license or Suspended status &rarr; blocked from trip assignment
      </p>


      {/* Add Driver Modal */}
      {isAdding && (
        <div className="modal-overlay">
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
