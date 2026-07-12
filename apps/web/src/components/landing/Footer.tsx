export function Footer() {
  const footerLinks = [
    { title: "Company", links: ["About", "Careers", "News", "Contact"] },
    { title: "Product", links: ["Features", "Pricing", "Integrations", "Changelog"] },
    { title: "Resources", links: ["Documentation", "Blog", "Webinars", "Support"] },
    { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "Cookies"] },
  ];

  return (
    <footer style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "80px", paddingBottom: "40px", backgroundColor: "var(--bg-secondary)" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "60px" }}>
          
          <div style={{ flex: "2 1 300px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-cyan)", marginBottom: "16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.5px" }}>
                Transit<span className="text-accent">Ops</span>
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, maxWidth: "300px", marginBottom: "24px" }}>
              The operating system for modern transit networks. Smarter routing, happier drivers, better cities.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              {/* Social icons */}
              {['twitter', 'linkedin', 'github'].map((social) => (
                <a key={social} href="#" style={{ color: "var(--text-muted)", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "var(--text-main)"} onMouseOut={e => e.currentTarget.style.color = "var(--text-muted)"}>
                  <div style={{ width: "24px", height: "24px", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }} />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((col, i) => (
            <div key={i}>
              <h4 style={{ color: "var(--text-main)", fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "var(--accent-cyan)"} onMouseOut={e => e.currentTarget.style.color = "var(--text-muted)"}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", color: "var(--text-muted)", fontSize: "13px" }}>
          <div>&copy; {new Date().getFullYear()} TransitOps Inc. All rights reserved.</div>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>Status: All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
