import { FormEvent, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button, Card, Spinner } from "../components/ui";
import { TextField, PasswordField, SelectField } from "../components/forms";
import * as validators from "../lib/validators";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../types";
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
  const from = (location.state as LocationState | null)?.from ?? ROUTES.dashboard;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("fleet_manager");
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
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Client-side validations
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
      // Render locked or credential errors cleanly
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
    setSelectedRole(demoRole);
    setEmailError(null);
    setPasswordError(null);
    setError(null);
  };

  return (
    <div className="auth-layout" style={{ display: "flex", width: "100%", padding: 0 }}>
      {/* Left panel - Brand & Demo roles */}
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
<<<<<<< Updated upstream
        <div style={{ margin: "var(--space-4) 0 0 var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-2)" }}>
            <div style={{ width: "24px", height: "24px", background: "#f0a500", borderRadius: "4px" }} />
            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "#fff" }}>TransitOps</h1>
          </div>
          <p style={{ color: "var(--color-muted)", fontSize: "1rem", margin: "0 0 var(--space-4)" }}>
            Smart Transport Operations Platform
          </p>
=======
        
        <Link to="/" style={{ position: "absolute", top: "32px", left: "32px", color: "#8b949e", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#8b949e"}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to home
        </Link>

        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          
          <h1 style={{ fontSize: "36px", fontWeight: 700, margin: "0 0 16px 0", letterSpacing: "-1px" }}>Join TransitOps in seconds.</h1>
          <p style={{ margin: 0, color: "#8b949e", fontSize: "16px", lineHeight: "1.5" }}>Your friendly transport companion is ready to turn every operation into a clean, validated workflow.</p>
>>>>>>> Stashed changes
        </div>

        <div style={{ margin: "0 0 0 var(--space-4)", maxWidth: "400px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#fff", margin: "0 0 var(--space-3)" }}>One login, four roles:</h2>
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
                  color: selectedRole === acc.roleValue ? "#f0a500" : "var(--color-muted)",
                  fontSize: "1rem",
                  fontWeight: selectedRole === acc.roleValue ? "600" : "normal",
                  transition: "all 0.15s ease"
                }}
              >
                <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: selectedRole === acc.roleValue ? "#f0a500" : "var(--color-muted)" }} />
                {acc.role}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ margin: "0 0 var(--space-4) var(--space-4)", color: "var(--color-muted)", fontSize: "0.8125rem", letterSpacing: "0.05em" }}>
          TRANSITOPS &copy; 2026 &middot; RBAC ENABLED
        </div>
      </div>

      {/* Right panel - Form */}
      <div style={{
        flex: 1,
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4)"
      }}>
<<<<<<< Updated upstream
        <Card style={{ width: "100%", maxWidth: "450px", padding: "var(--space-4)" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.625rem", fontWeight: 700 }}>Sign in to your account</h2>
          <p className="text-muted" style={{ margin: "0 0 var(--space-4)", fontSize: "0.9375rem" }}>Enter your credentials to continue</p>
          <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
            <TextField
              id="email"
              label="EMAIL"
              type="email"
              placeholder="Raven.k@transitops.in"
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
            <SelectField
              id="roleSelect"
              label="ROLE (RBAC)"
              required
              options={[
                { value: "fleet_manager", label: "Fleet Manager" },
                { value: "driver", label: "Driver" },
                { value: "safety_officer", label: "Safety Officer" },
                { value: "financial_analyst", label: "Financial Analyst" },
              ]}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            />
=======
        <div style={{
          width: "100%",
          maxWidth: "420px",
          background: "#080808",
          borderRadius: "16px",
          border: "1px solid #1f1f1f",
          padding: "40px",
        }}>
          
        
>>>>>>> Stashed changes

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
                <li>&bull; Fleet Manager &rarr; Fleet, Maintenance</li>
                <li>&bull; Dispatcher &rarr; Dashboard, Trips</li>
                <li>&bull; Safety Officer &rarr; Drivers, Compliance</li>
                <li>&bull; Financial Analyst &rarr; Fuel &amp; Expenses, Analytics</li>
              </ul>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
