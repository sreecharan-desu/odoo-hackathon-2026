import { FormEvent, useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { Spinner } from "../components/ui";
import * as validators from "../lib/validators";
import { useAuth } from "../hooks/useAuth";
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

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
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
  const from = (location.state as LocationState | null)?.from ?? ROUTES.dashboard;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("fleet_manager");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      width: "100%",
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
      alignItems: "stretch"
    }}>
      
      {/* LEFT PANEL */}
      <div style={{
        flex: 1,
        backgroundColor: "#111111",
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        backgroundPosition: "center center",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRight: "1px solid #1f1f1f",
        padding: "40px"
      }}>
        
        <Link to="/" style={{ position: "absolute", top: "32px", left: "32px", color: "#8b949e", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to home
        </Link>

        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "#fff", borderRadius: "6px" }}>
              <span style={{ fontWeight: 900, fontSize: "18px", color: "#000", letterSpacing: "-1px" }}>T</span>
            </div>
            <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" }}>TransitOps</span>
          </div>
          
          <h1 style={{ fontSize: "36px", fontWeight: 700, margin: "0 0 16px 0", letterSpacing: "-1px" }}>Join TransitOps in seconds.</h1>
          <p style={{ margin: 0, color: "#8b949e", fontSize: "16px", lineHeight: "1.5" }}>Your friendly transport companion is ready to turn every operation into a clean, validated workflow.</p>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1,
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "420px",
          background: "#080808",
          borderRadius: "16px",
          border: "1px solid #1f1f1f",
          padding: "40px",
        }}>
          
          

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 8px 0" }}>Sign in to your account</h2>
            <p style={{ margin: 0, color: "#8b949e", fontSize: "13px" }}>Start managing your fleet — no card required.</p>
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
                    width: "100%", padding: "12px 14px 12px 42px", background: "#0a0a0a", border: "1px solid #222",
                    borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#444"}
                  onBlur={(e) => e.target.style.borderColor = "#222"}
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
                    width: "100%", padding: "12px 42px 12px 42px", background: "#0a0a0a", border: "1px solid #222",
                    borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#444"}
                  onBlur={(e) => e.target.style.borderColor = "#222"}
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

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Role (RBAC)</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "14px", display: "flex", pointerEvents: "none" }}>
                  <UserIcon />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 14px 12px 42px", background: "#0a0a0a", border: "1px solid #222",
                    borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box", appearance: "none", cursor: "pointer"
                  }}
                >
                  <option value="fleet_manager">Fleet Manager</option>
                  <option value="driver">Driver</option>
                  <option value="safety_officer">Safety Officer</option>
                  <option value="financial_analyst">Financial Analyst</option>
                </select>
                <div style={{ position: "absolute", right: "14px", display: "flex", pointerEvents: "none", opacity: 0.5 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ padding: "12px", background: "rgba(248, 81, 73, 0.1)", border: "1px solid rgba(248, 81, 73, 0.4)", borderRadius: "8px", color: "#f85149", fontSize: "13px", textAlign: "center" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%", padding: "14px", background: "#ffffff", border: "none",
                borderRadius: "8px", color: "#000000", fontSize: "14px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
                transition: "all 0.2s", marginTop: "8px", boxSizing: "border-box"
              }}
              onMouseOver={(e) => { if(!submitting) e.currentTarget.style.background = "#f0f0f0" }}
              onMouseOut={(e) => { if(!submitting) e.currentTarget.style.background = "#ffffff" }}
            >
              {submitting ? "Signing in..." : "Sign in to account"}
            </button>

          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <p style={{ color: "#8b949e", fontSize: "13px", margin: 0 }}>
              Don't have an account? <a href="#" style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }} onClick={(e) => e.preventDefault()}>Contact Admin</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
