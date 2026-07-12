import { FormEvent, useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { Spinner } from "../components/ui";
import * as validators from "../lib/validators";
import { useAuth } from "../hooks/useAuth";
import { canAccessRoute, getHomeRoute } from "../lib/rbac";
import { ROUTES } from "../types";
import "../components/layout/shell.css";

type LocationState = {
  from?: string;
};

// Simple inline SVGs for the inputs
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, cursor: "pointer" }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const requested = (location.state as LocationState | null)?.from;
  const home = getHomeRoute(user);
  const redirectTo =
    user && requested && canAccessRoute(user, requested) ? requested : home;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <div style={{ background: "var(--color-bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectTo || ROUTES.dashboard} replace />;
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
      if (message.toLowerCase().includes("credentials") || message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("password")) {
        setError("Invalid email or password.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      width: "100%",
      color: "var(--color-text)",
      alignItems: "stretch"
    }}>
      
      {/* LEFT PANEL */}
      <div style={{
        flex: 1,
        backgroundColor: "var(--color-surface)",
        backgroundImage: `
          linear-gradient(var(--color-border) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        backgroundPosition: "center center",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRight: "1px solid var(--color-border)",
        padding: "40px"
      }}>
        
        <Link to={ROUTES.home} style={{ position: "absolute", top: "32px", left: "32px", color: "var(--color-muted)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to home
        </Link>

        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "var(--color-text)", borderRadius: "6px" }}>
              <span style={{ fontWeight: 900, fontSize: "18px", color: "var(--color-bg)", letterSpacing: "-1px" }}>T</span>
            </div>
            <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" }}>TransitOps</span>
          </div>
          
          <h1 style={{ fontSize: "36px", fontWeight: 700, margin: "0 0 16px 0", letterSpacing: "-1px" }}>Join TransitOps in seconds.</h1>
          <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "16px", lineHeight: "1.5" }}>Your friendly transport companion is ready to turn every operation into a clean, validated workflow.</p>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1,
        backgroundColor: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--color-surface)",
          borderRadius: "16px",
          border: "1px solid var(--color-border)",
          padding: "40px",
        }}>
          
          

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 8px 0" }}>Sign in to your account</h2>
            <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "13px" }}>Start managing your fleet — no card required.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Email</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "14px", display: "flex" }}>
                  <MailIcon />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="you@example.com"
                  style={{
                    width: "100%", padding: "12px 14px 12px 42px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
                    borderRadius: "8px", color: "var(--color-text)", fontSize: "14px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-line-strong)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                />
              </div>
              {emailError && <div style={{ color: "#f85149", fontSize: "12px", marginTop: "6px" }}>{emailError}</div>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "14px", display: "flex" }}>
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="At least 8 characters"
                  style={{
                    width: "100%", padding: "12px 42px 12px 42px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
                    borderRadius: "8px", color: "var(--color-text)", fontSize: "14px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--color-line-strong)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                />
                <div 
                  style={{ position: "absolute", right: "14px", display: "flex", cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon />
                </div>
              </div>
              {passwordError && <div style={{ color: "#f85149", fontSize: "12px", marginTop: "6px" }}>{passwordError}</div>}
            </div>

            <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "12px", lineHeight: 1.45 }}>
              Role is assigned on your account after sign-in (Fleet Manager, Driver, Safety Officer, or Financial Analyst).
            </p>

            {error && (
              <div style={{ padding: "12px", background: "rgba(248, 81, 73, 0.1)", border: "1px solid rgba(248, 81, 73, 0.4)", borderRadius: "8px", color: "#f85149", fontSize: "13px", textAlign: "center" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="button"
              style={{ width: "100%", padding: "14px", marginTop: "8px", boxSizing: "border-box", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Signing in..." : "Sign in to account"}
            </button>

          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <p style={{ color: "var(--color-muted)", fontSize: "13px", margin: 0 }}>
              Don't have an account? <a href="#" style={{ color: "var(--color-text)", textDecoration: "none", fontWeight: 600 }} onClick={(e) => e.preventDefault()}>Contact Admin</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
