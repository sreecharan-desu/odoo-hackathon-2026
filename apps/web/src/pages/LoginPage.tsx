import { FormEvent, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button, Card, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../types";
import "../components/layout/shell.css";

type LocationState = {
  from?: string;
};

const DEMO_ACCOUNTS = [
  { role: "Fleet Manager", email: "fleet@example.com", password: "Password123!" },
  { role: "Driver", email: "driver@example.com", password: "Password123!" },
  { role: "Safety Officer", email: "safety@example.com", password: "Password123!" },
  { role: "Financial Analyst", email: "finance@example.com", password: "Password123!" },
];

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? ROUTES.dashboard;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const handlePreFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="auth-layout" style={{ display: "flex", width: "100%", padding: 0 }}>
      {/* Left panel - Brand & Demo roles */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #2b1f2d, #141a29)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, margin: "0 0 var(--space-2)" }}>TransitOps</h1>
          <p style={{ color: "var(--color-muted)", fontSize: "1.125rem", margin: "0 0 var(--space-4)" }}>
            Smart Transport Operations Platform
          </p>
          <div style={{ marginTop: "var(--space-4)" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 var(--space-3)" }}>Demo Credentials (Click to pre-fill):</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <div
                  key={acc.role}
                  onClick={() => handlePreFill(acc.email, acc.password)}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "var(--radius)",
                    padding: "var(--space-2) var(--space-3)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.9375rem" }}>{acc.role}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginLeft: "var(--space-2)" }}>
                      {acc.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
        <Card style={{ width: "100%", maxWidth: "400px", padding: "var(--space-4)" }}>
          <h2 style={{ margin: "0 0 var(--space-1)", fontSize: "1.5rem" }}>Sign in</h2>
          <p className="text-muted" style={{ margin: "0 0 var(--space-4)" }}>Enter your account details to access the dashboard</p>
          <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-field" style={{ marginTop: "var(--space-3)" }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="error" style={{ margin: "var(--space-2) 0 0" }}>{error}</p>}
            <Button type="submit" disabled={submitting} style={{ marginTop: "var(--space-4)", width: "100%" }}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
