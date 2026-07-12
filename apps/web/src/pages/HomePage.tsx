import { useEffect } from "react";
import "../styles/globals.css";

import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { DashboardPreview } from "../components/landing/DashboardPreview";
import { FeatureSection } from "../components/landing/FeatureSection";
import { useTheme } from "../hooks/useTheme";

export default function HomePage() {
  const { isDark } = useTheme();

  // Force dark theme on landing page first load (if no saved preference)
  useEffect(() => {
    const stored = localStorage.getItem("transitops-theme");
    if (!stored) {
      // Default to dark for landing page
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div
      className="landing-page"
      style={{
        background: isDark ? "var(--bg-primary, #071318)" : "var(--color-paper, #ffffff)",
        minHeight: "100vh",
        color: isDark ? "var(--text-main, #f0fdfa)" : "var(--color-text, #0a0a0a)",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <Navbar />
      <Hero />
      <DashboardPreview />
      <FeatureSection />
    </div>
  );
}
