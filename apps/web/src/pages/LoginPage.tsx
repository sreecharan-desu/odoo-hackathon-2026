import { FormEvent, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button, Card, Spinner } from "../components/ui";
import { TextField, PasswordField } from "../components/forms";
import * as validators from "../lib/validators";
import { useAuth } from "../hooks/useAuth";
import { canAccessRoute, getHomeRoute } from "../lib/rbac";
import "../components/layout/shell.css";

type LocationState = {
  from?: string;
};

const DEMO_ACCOUNTS = [
  { role: "Fleet Manager", roleValue: "fleet_manager", email: "fleet@example.com", password: "Password123!" },
  { role: "Driver", roleValue: "driver", email: "driver@example.com", password: "Password123!" },
  { role: "Safety Officer", roleValue: "safety_officer", email: "safety@example.com", password: "Password123!" },
  { role: "Financial Analyst", roleValue: "financial_analyst", email: "finance@example.com", password: "Password123!" },
];

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const requested = (location.state as LocationState | null)?.from;
  const home = user ? getHomeRoute(user) : "/";
  const redirectTo =
    user && requested && canAccessRoute(user, requested) ? requested : home;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDemo, setSelectedDemo] = useState("fleet_manager");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="auth-layout">
        <Spinner />
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const emailErr = validators.email(email);
    const passErr = validators.password(password);

    setEmailError(emailErr);
    setPasswordError(passErr);

    if (emailErr || passErr) {
      return;
    }

    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      if (message.toLowerCase().includes("credentials") || message.toLowerCase().includes("unauthorized")) {
        setError("Invalid credentials. Account locked after 5 failed attempts.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const handlePreFill = (demoEmail: string, demoPass: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setSelectedDemo(demoRole);
    setEmailError(null);
    setPasswordError(null);
    setError(null);
  };

  return (
    <div className="auth-layout" style={{ display: "flex", width: "100%", padding: 0 }}>
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #1b2430, #111823)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <div style={{ margin: "var(--space-4) 0 0 var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-2)" }}>
            <div style={{ width: "24px", height: "24px", background: "#f0a500", borderRadius: "4px" }} />
            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "#fff" }}>TransitOps</h1>
          </div>
          <p style={{ color: "var(--color-muted)", fontSize: "1rem", margin: "0 0 var(--space-4)" }}>
            Smart Transport Operations Platform
          </p>
        </div>

        <div style={{ margin: "0 0 0 var(--space-4)", maxWidth: "400px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#fff", margin: "0 0 var(--space-3)" }}>Demo accounts (click to fill):</h2>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <li
                key={acc.role}
                onClick={() => handlePreFill(acc.email, acc.password, acc.roleValue)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  cursor: "pointer",
                  color: selectedDemo === acc.roleValue ? "#f0a500" : "var(--color-muted)",
                  fontSize: "1rem",
                  fontWeight: selectedDemo === acc.roleValue ? "600" : "normal",
                  transition: "all 0.15s ease"
                }}
              >
                <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: selectedDemo === acc.roleValue ? "#f0a500" : "var(--color-muted)" }} />
                {acc.role}
                <span style={{ fontSize: "0.8125rem", opacity: 0.7 }}>({acc.email})</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ margin: "0 0 var(--space-4) var(--space-4)", color: "var(--color-muted)", fontSize: "0.8125rem", letterSpacing: "0.05em" }}>
          TRANSITOPS &copy; 2026 &middot; ROLE FROM ACCOUNT
        </div>
      </div>

      <div style={{
        flex: 1,
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4)"
      }}>
        <Card style={{ width: "100%", maxWidth: "450px", padding: "var(--space-4)" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.625rem", fontWeight: 700 }}>Sign in to your account</h2>
          <p className="text-muted" style={{ margin: "0 0 var(--space-4)", fontSize: "0.9375rem" }}>
            Email and password only — your role is loaded from the account after login.
          </p>
          <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
            <TextField
              id="email"
              label="EMAIL"
              type="email"
              placeholder="fleet@example.com"
              autoComplete="email"
              required
              value={email}
              error={emailError}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
            />
            <PasswordField
              id="password"
              label="PASSWORD"
              autoComplete="current-password"
              required
              value={password}
              error={passwordError}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)", fontSize: "0.875rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--color-text)" }}>
                <input type="checkbox" style={{ accentColor: "#f0a500" }} defaultChecked />
                Remember me
              </label>
              <a href="#" style={{ color: "#3b82f6", textDecoration: "none" }} onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>

            {error && (
              <div style={{
                marginTop: "var(--space-3)",
                padding: "8px 12px",
                border: "1px solid rgba(220, 53, 69, 0.3)",
                background: "rgba(220, 53, 69, 0.08)",
                borderRadius: "var(--radius)",
                fontSize: "0.875rem",
                color: "var(--color-error)",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span>&#10006;</span> {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: "var(--space-4)",
                width: "100%",
                background: "#f0a500",
                borderColor: "#f0a500",
                color: "#000",
                fontWeight: 700
              }}
            >
              {submitting ? "Signing in…" : "Sign In"}
            </Button>

            <hr style={{ border: 0, borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "var(--space-4) 0 var(--space-3)" }} />

            <div style={{ fontSize: "0.8125rem", color: "var(--color-muted)", lineHeight: 1.5 }}>
              <p style={{ fontWeight: 600, margin: "0 0 6px" }}>Access is scoped by role after login:</p>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                <li>&bull; Fleet Manager &rarr; full ops (Fleet, Trips, Maintenance, Analytics)</li>
                <li>&bull; Driver &rarr; Trips-first, deliveries &amp; fuel logs</li>
                <li>&bull; Safety Officer &rarr; Drivers, licenses &amp; safety scores</li>
                <li>&bull; Financial Analyst &rarr; Fuel, expenses &amp; Analytics</li>
              </ul>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
