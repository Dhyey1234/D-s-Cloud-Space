import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const features = [
  { icon: "📁", color: "blue",   title: "File Storage & Management", desc: "Upload, organise, preview and share files with full version history, trash recovery, and smart search." },
  { icon: "🔐", color: "purple", title: "RBAC & Permissions",         desc: "Granular role-based access control with custom roles, per-resource permissions, and instant revocation." },
  { icon: "🏢", color: "teal",   title: "Organisations",              desc: "Create isolated workspaces per organisation. Invite members, manage roles, and switch between orgs seamlessly." },
  { icon: "📜", color: "amber",  title: "Policy Center",              desc: "Define retention policies, compliance rules, and storage quotas. GDPR, HIPAA, and SOC2 readiness indicators." },
  { icon: "🛡️", color: "red",   title: "Security Center",            desc: "AES-256 encryption, full audit logs, threat detection alerts, and a real-time security dashboard." },
  { icon: "📊", color: "green",  title: "Analytics & Monitoring",     desc: "Storage usage, access patterns, activity heatmaps, and simulated billing cost estimator." },
];

const members = [
  { initials: "DK", name: "D Desai",      email: "d@cloudspace.io",    role: "Owner",  color: "#3B8BEB" },
  { initials: "D", name: "Dhyey", email: "dhyey@cloudspace.io", role: "Admin",  color: "#8B5CF6" },
  { initials: "DD", name: "Dhyey Desai",   email: "desai@cloudspace.io", role: "Member", color: "#1DCFB0" },
  { initials: "HP", name: "Hardik Pandya",    email: "hardik@cloudspace.io", role: "Viewer", color: "#F59E0B" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="grid-bg" />
      <div className="glow" />
      <div className="glow2" />

      {/* NAV */}
      <nav className="navbar">
        <div className="nav-inner">
          <div className="logo">
            <div className="logo-icon">☁</div>
            D's <span>CloudSpace</span>
          </div>
          <ul className="nav-links">
            {["Features", "Organisations", "Security", "Pricing", "Docs"].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
          <div className="nav-btns">
            <button className="btn-ghost" onClick={() => navigate("/login")}>Log in</button>
            <button className="btn-primary" onClick={() => navigate("/signup")}>Get started</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="badge">
            <div className="badge-dot" />
            Enterprise Cloud Platform — Now in Development
          </div>
          <h1>Your organisation's cloud — <span className="grad">reimagined</span></h1>
          <p className="hero-sub">
            D's CloudSpace is an enterprise-grade cloud file storage and management platform.
            Manage files, teams, roles, policies, and security — all from one unified portal.
          </p>
          <div className="hero-btns">
            <button className="btn-primary btn-lg" onClick={() => navigate("/signup")}>Start for free</button>
            <button className="btn-outline-lg" onClick={() => navigate("/create-org")}>Create an organisation</button>
          </div>

          <div className="stats">
            {[
              { num: "10+",     label: "Core modules" },
              { num: "AES-256", label: "Encryption standard" },
              { num: "RBAC",    label: "Role-based access" },
              { num: "Multi",   label: "Organisation support" },
            ].map(s => (
              <div className="stat-item" key={s.label}>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="wrap">
          <p className="section-label">Platform features</p>
          <h2 className="section-title">Everything your team needs</h2>
          <p className="section-sub">A complete enterprise platform — from secure file storage to compliance dashboards, all in one place.</p>
          <div className="features-grid">
            {features.map(f => (
              <div className="feature-card" key={f.title}>
                <div className={`feature-icon icon-${f.color}`}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ORG SECTION */}
      <section className="section">
        <div className="wrap">
          <div className="org-section">
            <div className="org-visual">
              <div className="org-header">
                <div className="org-avatar">D</div>
                <div>
                  <div className="org-name">D's Engineering Org</div>
                  <div className="org-role">4 members · 12.4 GB used</div>
                </div>
              </div>
              {members.map(m => (
                <div className="member-row" key={m.email}>
                  <div className="member-info">
                    <div className="avatar-sm" style={{ background: m.color }}>{m.initials}</div>
                    <div>
                      <div className="member-name">{m.name}</div>
                      <div className="member-email">{m.email}</div>
                    </div>
                  </div>
                  <span className={`role-badge role-${m.role.toLowerCase()}`}>{m.role}</span>
                </div>
              ))}
            </div>

            <div className="org-text">
              <h2>Built for teams & organisations</h2>
              <p>Create your organisation and invite your entire team. Every member gets a role, every file gets a policy, and every action gets logged.</p>
              <ul className="org-perks">
                {[
                  "Create and manage multiple organisations",
                  "Invite members via email",
                  "Assign roles — Owner, Admin, Member, Viewer",
                  "Per-organisation storage quotas",
                  "Transfer ownership anytime",
                  "Isolated storage and policies per org",
                ].map(p => (
                  <li key={p}><span className="check">✓</span>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="wrap">
          <h2>Ready to get started?</h2>
          <p>Choose how you'd like to join D's CloudSpace today.</p>
          <div className="cta-cards">
            {[
              { icon: "👤", title: "Sign up",      desc: "Create a personal account in minutes",          path: "/signup" },
              { icon: "🔑", title: "Log in",       desc: "Already have an account? Jump right back in",   path: "/login" },
              { icon: "🏢", title: "Create org",   desc: "Set up your organisation and invite your team", path: "/create-org" },
            ].map(c => (
              <div className="cta-card" key={c.title} onClick={() => navigate(c.path)}>
                <div className="cta-card-icon">{c.icon}</div>
                <div className="cta-card-title">{c.title}</div>
                <div className="cta-card-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="logo">
            <div className="logo-icon" style={{ width: 26, height: 26, fontSize: 12 }}>☁</div>
            D's CloudSpace
          </div>
          <div className="footer-links">
            {["Privacy", "Terms", "Security", "Status", "Docs"].map(l => (
              <a href="#" key={l}>{l}</a>
            ))}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>© 2026 D's CloudSpace. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}