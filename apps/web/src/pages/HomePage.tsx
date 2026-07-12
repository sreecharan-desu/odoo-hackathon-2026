import { useEffect } from "react";
import "../styles/globals.css";

import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { DashboardPreview } from "../components/landing/DashboardPreview";
import { FeatureSection } from "../components/landing/FeatureSection";
import { StatsSection } from "../components/landing/StatsSection";
import { Testimonials } from "../components/landing/Testimonials";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";

export default function HomePage() {
  // Ensure the body has the dark background if it doesn't already
  useEffect(() => {
    document.body.style.backgroundColor = "var(--bg-primary)";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <FeatureSection />
      <StatsSection />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
