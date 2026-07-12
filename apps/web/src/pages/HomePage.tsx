import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../types";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate the scaling and border-radius for the Hero container
  // It scales from 1 to 0.9 over the first 400px of scrolling
  const scale = Math.max(0.9, 1 - scrollY / 4000);
  const borderRadius = Math.min(40, scrollY / 10);
  const opacity = Math.max(0, 1 - scrollY / 800); // fade out hero slightly

  return (
    <div style={{ backgroundColor: "#00c853", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 
        SECTION 1: HERO SCALING CONTAINER 
        We use a 130vh spacer so the user has to scroll 30vh before the next section 
        slides up over the sticky hero.
      */}
      <div style={{ height: "130vh", position: "relative" }}>
        
        {/* Sticky Container */}
        <div style={{ 
          position: "sticky", 
          top: "0", 
          height: "100vh", 
          width: "100%",
          backgroundColor: "#000",
          transform: `scale(${scale})`,
          borderRadius: `${borderRadius}px`,
          overflow: "hidden",
          transition: "transform 0.05s linear, border-radius 0.05s linear",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column"
        }}>
          
          {/* Background Glows */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", zIndex: 0, pointerEvents: "none", opacity: 0.3 }} />
          <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(0,234,100,0.15) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

          {/* Navbar */}
          <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px 48px", width: "100%", maxWidth: "1400px", margin: "0 auto", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>TransitOps</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
              <a href="#products" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "15px", fontWeight: 500, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#a1a1aa"}>Products</a>
              <a href="#solutions" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "15px", fontWeight: 500, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#a1a1aa"}>Solutions</a>
              <a href="#resources" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "15px", fontWeight: 500, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#a1a1aa"}>Resources</a>
              <a href="#pricing" style={{ color: "#a1a1aa", textDecoration: "none", fontSize: "15px", fontWeight: 500, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#a1a1aa"}>Pricing</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <a href="#" style={{ color: "#fff", textDecoration: "none", fontSize: "15px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                For Developers
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <Link to={ROUTES.login} style={{ padding: "12px 24px", background: "#00ea64", color: "#000", borderRadius: "100px", textDecoration: "none", fontSize: "15px", fontWeight: 600, transition: "all 0.2s", boxShadow: "0 0 20px rgba(0, 234, 100, 0.4)" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
                Sign Up
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <main style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: "10vh", opacity }}>
            <h1 style={{ fontSize: "8vw", fontWeight: 500, margin: "0", letterSpacing: "-3px", lineHeight: "1", color: "#666" }}>
              The future
            </h1>
            <h1 style={{ fontSize: "8vw", fontWeight: 500, margin: "0", letterSpacing: "-3px", lineHeight: "1", color: "#666" }}>
              of operations
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2vw" }}>
              <h1 style={{ fontSize: "8vw", fontWeight: 500, margin: "0", letterSpacing: "-3px", lineHeight: "1", color: "#fff" }}>
                is
              </h1>
              {/* Graphic Icon 1 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="6vw" height="6vw" viewBox="0 0 24 24" fill="none" stroke="#00ea64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 0-10 10v2a10 10 0 0 0 10 10 10 10 0 0 0 10-10v-2a10 10 0 0 0-10-10z"/><path d="M12 6a6 6 0 0 0-6 6v2a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-2a6 6 0 0 0-6-6z"/><path d="M12 10a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"/></svg>
              </div>
              <h1 style={{ fontSize: "8vw", fontWeight: 500, margin: "0", letterSpacing: "-3px", lineHeight: "1", color: "#fff" }}>
                human +
              </h1>
              {/* Graphic Icon 2 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="6vw" height="6vw" viewBox="0 0 24 24" fill="none" stroke="#00a3ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <h1 style={{ fontSize: "8vw", fontWeight: 500, margin: "0", letterSpacing: "-3px", lineHeight: "1", color: "#fff" }}>
                AI
              </h1>
            </div>
            
            <p style={{ fontSize: "20px", color: "#a1a1aa", maxWidth: "700px", margin: "32px 0 48px 0", lineHeight: "1.6" }}>
              We help you dispatch trips, track vehicle health, and monitor safety signals to thrive in an AI-assisted world.
            </p>

            <Link to={ROUTES.login} style={{ padding: "16px 40px", background: "transparent", border: "1px solid rgba(0, 234, 100, 0.4)", color: "#fff", borderRadius: "10px", textDecoration: "none", fontSize: "18px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.3s", boxShadow: "inset 0 0 20px rgba(0, 234, 100, 0.1), 0 0 40px rgba(0, 234, 100, 0.2)" }} onMouseOver={e => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0, 234, 100, 0.3), 0 0 60px rgba(0, 234, 100, 0.4)"; e.currentTarget.style.border = "1px solid rgba(0, 234, 100, 0.8)"; }} onMouseOut={e => { e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0, 234, 100, 0.1), 0 0 40px rgba(0, 234, 100, 0.2)"; e.currentTarget.style.border = "1px solid rgba(0, 234, 100, 0.4)"; }}>
              Join The Community
            </Link>
          </main>
          
          {/* Cookie Consent Footer */}
          <div style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(20,20,20,0.8)", backdropFilter: "blur(10px)", border: "1px solid #333", borderRadius: "100px", padding: "16px 24px", width: "90%", maxWidth: "800px", zIndex: 20 }}>
            <p style={{ margin: 0, color: "#8b949e", fontSize: "13px", lineHeight: "1.5" }}>
              We set essential cookies to help run our websites and services. By clicking Accept, you consent to the use of additional cookies for analytics. Read more in our <a href="#" style={{ color: "#fff" }}>Cookie Policy</a>.
            </p>
            <div style={{ display: "flex", gap: "12px", marginLeft: "24px" }}>
              <button style={{ padding: "8px 20px", background: "transparent", border: "1px solid #333", color: "#fff", borderRadius: "100px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>Decline</button>
              <button style={{ padding: "8px 20px", background: "#00ea64", border: "none", color: "#000", borderRadius: "100px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>Accept</button>
            </div>
          </div>
        </div>
      </div>

      {/* 
        SECTION 2: CHOOSE YOUR ADVENTURE (LIGHT MODE) 
        This slides up *over* the sticky hero container.
      */}
      <div style={{ position: "relative", zIndex: 10, backgroundColor: "#fff", borderTopLeftRadius: "60px", borderTopRightRadius: "60px", padding: "120px 48px", marginTop: "-40px", boxShadow: "0 -20px 60px rgba(0,0,0,0.3)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <h2 style={{ fontSize: "56px", fontWeight: 600, color: "#111", margin: "0 0 16px 0", letterSpacing: "-1.5px" }}>Choose Your Adventure</h2>
          <p style={{ fontSize: "20px", color: "#666", maxWidth: "600px", margin: "0 auto", lineHeight: "1.5" }}>
            We build elite tech platforms for companies and enhance candidates' tech skills and job prospects.
          </p>
        </div>

        {/* Card Grid */}
        <div style={{ display: "flex", gap: "32px", maxWidth: "1200px", margin: "0 auto", flexWrap: "wrap" }}>
          
          {/* Developer Card */}
          <div style={{ flex: "1 1 500px", backgroundColor: "#0a0a0a", borderRadius: "32px", padding: "64px", position: "relative", overflow: "hidden", minHeight: "450px" }}>
            <h3 style={{ fontSize: "32px", fontWeight: 600, color: "#fff", margin: "0 0 16px 0", letterSpacing: "-0.5px" }}>For developers</h3>
            <p style={{ fontSize: "16px", color: "#a1a1aa", margin: "0 0 32px 0", lineHeight: "1.6", maxWidth: "80%" }}>
              TransitOps helps you track your delivery routes and become compliance ready.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 48px 0", color: "#fff", fontSize: "16px", lineHeight: "2.5" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "6px", height: "6px", background: "#00ea64", borderRadius: "50%" }} /> Track your route efficiency
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "6px", height: "6px", background: "#00ea64", borderRadius: "50%" }} /> Prepare for safety audits
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "6px", height: "6px", background: "#00ea64", borderRadius: "50%" }} /> Learn the latest EV skills
              </li>
            </ul>
            <a href="#" style={{ display: "inline-block", padding: "16px 32px", background: "#1f1f1f", color: "#00ea64", borderRadius: "8px", textDecoration: "none", fontWeight: 600, border: "1px solid #333", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#2a2a2a"} onMouseOut={e => e.currentTarget.style.background = "#1f1f1f"}>
              Explore Driver Community
            </a>
            
            {/* Floating UI Mockup */}
            <div style={{ position: "absolute", bottom: "-20px", right: "-40px", width: "300px", height: "300px", background: "linear-gradient(145deg, #111, #0a0a0a)", border: "1px solid #333", borderRadius: "24px", padding: "24px", boxShadow: "-20px -20px 60px rgba(0,234,100,0.1)", transform: "rotate(-5deg)", animation: "float 6s ease-in-out infinite" }}>
               <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                 <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f56" }} />
                 <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e" }} />
                 <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27c93f" }} />
               </div>
               <div style={{ fontSize: "20px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Live Map</div>
               <div style={{ height: "4px", width: "40px", background: "#00ea64", borderRadius: "2px", marginBottom: "24px" }} />
               
               <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                 <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(0,234,100,0.2)", border: "1px solid rgba(0,234,100,0.4)" }} />
                 <div>
                   <div style={{ height: "12px", width: "120px", background: "#333", borderRadius: "4px", marginBottom: "8px" }} />
                   <div style={{ height: "10px", width: "80px", background: "#222", borderRadius: "4px" }} />
                 </div>
               </div>
               <div style={{ display: "flex", alignItems: "center", gap: "16px", opacity: 0.5 }}>
                 <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#222" }} />
                 <div>
                   <div style={{ height: "12px", width: "100px", background: "#333", borderRadius: "4px", marginBottom: "8px" }} />
                   <div style={{ height: "10px", width: "60px", background: "#222", borderRadius: "4px" }} />
                 </div>
               </div>
            </div>
          </div>

          {/* Business Card */}
          <div style={{ flex: "1 1 500px", backgroundColor: "#0a0a0a", borderRadius: "32px", padding: "64px", position: "relative", overflow: "hidden", minHeight: "450px" }}>
            <h3 style={{ fontSize: "32px", fontWeight: 600, color: "#fff", margin: "0 0 16px 0", letterSpacing: "-0.5px" }}>For business</h3>
            <p style={{ fontSize: "16px", color: "#a1a1aa", margin: "0 0 32px 0", lineHeight: "1.6", maxWidth: "80%" }}>
              Get your company dispatch-ready.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 48px 0", color: "#fff", fontSize: "16px", lineHeight: "2.5" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "6px", height: "6px", background: "#00a3ff", borderRadius: "50%" }} /> Attract and hire the right drivers
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "6px", height: "6px", background: "#00a3ff", borderRadius: "50%" }} /> Upskill your team with the latest fleet tech
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "6px", height: "6px", background: "#00a3ff", borderRadius: "50%" }} /> Build out your AI platform team
              </li>
            </ul>
            <a href="#" style={{ display: "inline-block", padding: "16px 32px", background: "#1f1f1f", color: "#00a3ff", borderRadius: "8px", textDecoration: "none", fontWeight: 600, border: "1px solid #333", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#2a2a2a"} onMouseOut={e => e.currentTarget.style.background = "#1f1f1f"}>
              Explore Fleet Community
            </a>
            
            {/* Floating UI Mockup */}
            <div style={{ position: "absolute", bottom: "40px", right: "-20px", width: "240px", height: "240px", background: "linear-gradient(145deg, #111, #0a0a0a)", border: "1px solid #333", borderRadius: "24px", padding: "32px", boxShadow: "-20px -20px 60px rgba(0,163,255,0.1)", transform: "rotate(5deg)", animation: "float-reverse 8s ease-in-out infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at center, rgba(0,163,255,0.2) 0%, transparent 60%)" }} />
               <h3 style={{ fontSize: "40px", fontWeight: 800, color: "#fff", position: "relative", zIndex: 10, margin: 0 }}>GenAI</h3>
            </div>
          </div>
          
        </div>
      </div>

      {/* 
        SECTION 3: AI CHANGING SOFTWARE (STICKY SCROLL)
      */}
      <div style={{ backgroundColor: "#fafafa", padding: "120px 48px", position: "relative", zIndex: 10 }}>
        
        <div style={{ textAlign: "center", marginBottom: "120px" }}>
          <h2 style={{ fontSize: "48px", fontWeight: 600, color: "#00ea64", margin: 0, letterSpacing: "-1px" }}>AI Changing</h2>
          <h2 style={{ fontSize: "48px", fontWeight: 600, color: "#111", margin: 0, letterSpacing: "-1px" }}>Fleet Operations</h2>
        </div>

        {/* Grid Container */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          
          {/* Left Column (Sticky Text) */}
          <div style={{ position: "relative", height: "100%" }}>
            <div style={{ position: "sticky", top: "200px" }}>
              <div style={{ opacity: scrollY < 1200 ? 1 : 0.2, transition: "opacity 0.4s", marginBottom: "60px" }}>
                <h3 style={{ fontSize: "36px", fontWeight: 600, color: "#111", margin: "0 0 16px 0", letterSpacing: "-1px" }}><span style={{ color: "#00ea64" }}>GenAI</span> advances daily.</h3>
                <p style={{ fontSize: "20px", color: "#666", margin: 0 }}>It's able to route fleets & predict maintenance at a dizzying pace.</p>
              </div>
              <div style={{ opacity: scrollY >= 1200 && scrollY < 1800 ? 1 : 0.2, transition: "opacity 0.4s", marginBottom: "60px" }}>
                <h3 style={{ fontSize: "36px", fontWeight: 600, color: "#111", margin: "0 0 16px 0", letterSpacing: "-1px" }}><span style={{ color: "#00ea64" }}>GenAI</span> is becoming a part of everything.</h3>
              </div>
              <div style={{ opacity: scrollY >= 1800 ? 1 : 0.2, transition: "opacity 0.4s" }}>
                <h3 style={{ fontSize: "36px", fontWeight: 600, color: "#111", margin: "0 0 16px 0", letterSpacing: "-1px" }}><span style={{ color: "#00ea64" }}>GenAI</span> will execute more mundane operations tasks.</h3>
                <p style={{ fontSize: "20px", color: "#666", margin: 0 }}>Dispatchers will orchestrate the work of AI agents while focusing on higher level problem solving.</p>
              </div>
            </div>
          </div>

          {/* Right Column (Scrolling UI Mockups) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "100px", paddingBottom: "200px" }}>
            
            {/* Mockup 1: Ada Profile */}
            <div style={{ background: "#111", borderRadius: "32px", padding: "40px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", position: "relative" }}>
              <div style={{ width: "100%", height: "200px", background: "#333", borderRadius: "16px", marginBottom: "24px", backgroundImage: "url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800')", backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#444", border: "2px solid #00ea64" }} />
                <div>
                  <h4 style={{ margin: "0 0 4px 0", color: "#fff", fontSize: "24px" }}>Ada</h4>
                  <p style={{ margin: 0, color: "#a1a1aa", fontSize: "16px" }}>Machine Learning Engineer</p>
                </div>
              </div>
              <h5 style={{ margin: "0 0 16px 0", color: "#fff", fontSize: "18px" }}>Certifications</h5>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1, padding: "16px", background: "#1f1f1f", borderRadius: "12px", border: "1px solid #333" }}>
                  <div style={{ fontSize: "14px", color: "#fff", marginBottom: "8px" }}>Machine Learning Engineer</div>
                  <div style={{ fontSize: "12px", color: "#00ea64" }}>HackerRank</div>
                </div>
                <div style={{ flex: 1, padding: "16px", background: "#1f1f1f", borderRadius: "12px", border: "1px solid #333" }}>
                  <div style={{ fontSize: "14px", color: "#fff", marginBottom: "8px" }}>Data Scientist</div>
                  <div style={{ fontSize: "12px", color: "#00ea64" }}>HackerRank</div>
                </div>
              </div>
              
              {/* Overlapping badge card */}
              <div style={{ position: "absolute", bottom: "-60px", right: "-40px", background: "#111", padding: "32px", borderRadius: "24px", border: "1px solid #333", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", width: "300px" }}>
                <h5 style={{ margin: "0 0 20px 0", color: "#fff", fontSize: "16px" }}>Badges</h5>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#ffbd2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "bold" }}>A</div>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#ff5f56", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold" }}>B</div>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#27c93f", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "bold" }}>C</div>
                </div>
              </div>
            </div>

            {/* Mockup 2: AI Delegator */}
            <div style={{ background: "#111", borderRadius: "32px", padding: "40px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", marginTop: "120px" }}>
              <div style={{ width: "100%", height: "250px", background: "#333", borderRadius: "16px", marginBottom: "32px", backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800')", backgroundSize: "cover", backgroundPosition: "center" }} />
              
              <div style={{ padding: "24px", background: "#1f1f1f", borderRadius: "16px", border: "1px solid #333" }}>
                <h5 style={{ margin: "0 0 16px 0", color: "#a1a1aa", fontSize: "14px", textTransform: "uppercase" }}>AI Delegated</h5>
                <h4 style={{ margin: "0 0 16px 0", color: "#fff", fontSize: "20px" }}>Making API requests and handling responses</h4>
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                  <span style={{ padding: "6px 12px", background: "rgba(0,234,100,0.1)", color: "#00ea64", borderRadius: "100px", fontSize: "13px", fontWeight: 500 }}>✓ AI Help</span>
                  <span style={{ padding: "6px 12px", background: "#333", color: "#fff", borderRadius: "100px", fontSize: "13px", fontWeight: 500 }}>Score 7</span>
                </div>
                <div style={{ color: "#666", fontSize: "14px" }}>
                  May 24 – July 1
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ background: "#111", padding: "80px 48px", textAlign: "center" }}>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", marginBottom: "32px" }}>TransitOps</div>
        <p style={{ color: "#666", fontSize: "14px" }}>© 2026 TransitOps Inc. All rights reserved.</p>
      </footer>

      {/* Global animations */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(-5deg); }
            50% { transform: translateY(-20px) rotate(-5deg); }
            100% { transform: translateY(0px) rotate(-5deg); }
          }
          @keyframes float-reverse {
            0% { transform: translateY(0px) rotate(5deg); }
            50% { transform: translateY(20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(5deg); }
          }
          html, body {
            margin: 0;
            padding: 0;
            scroll-behavior: smooth;
          }
        `}
      </style>
    </div>
  );
}
