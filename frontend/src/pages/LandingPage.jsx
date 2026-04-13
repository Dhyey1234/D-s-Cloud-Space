import { useNavigate } from 'react-router-dom';
import ColorBends from '../components/ColorBends';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      <ColorBends
        className="landing-background"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        rotation={45}
        speed={0.15}
        colors={['#4E8CFF', '#7E7DFF', '#61FFA6', '#FFE76B']}
        transparent={true}
        autoRotate={18}
        scale={1.4}
        frequency={0.9}
        warpStrength={1.1}
        mouseInfluence={0.6}
        parallax={0.25}
        noise={0.06}
      />

      <header className="landing-nav">
        <div className="nav-brand">D's Cloud Space</div>
        <div className="nav-links">
          <button className="btn btn-link" onClick={handleLogin}>Sign In</button>
          <button className="btn btn-ghost" onClick={handleGetStarted}>Start Free</button>
        </div>
      </header>

      <main className="landing-content">
        <section className="landing-hero">
          <span className="hero-tag">Secure. Fast. Everywhere.</span>
          <h1 className="landing-title">Your files. Your rules. In the cloud.</h1>
          <p className="landing-description">
            D's Cloud Space gives you modern cloud storage with secure sharing, effortless access,
            and intelligent file management — built for creators, teams, and everyone who wants
            their data to stay safe and available.
          </p>

          <div className="landing-buttons">
            <button className="btn btn-primary" onClick={handleGetStarted}>
              Create Account
            </button>
            <button className="btn btn-secondary" onClick={handleLogin}>
              Sign In
            </button>
          </div>

          <div className="hero-highlights">
            <div>
              <strong>99.99%</strong>
              <span>uptime guarantee</span>
            </div>
            <div>
              <strong>256-bit</strong>
              <span>encryption</span>
            </div>
            <div>
              <strong>Instant</strong>
              <span>multi-device sync</span>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="feature-card">
            <h3>Encrypted Storage</h3>
            <p>Keep your files protected with strong encryption and secure access controls.</p>
          </div>
          <div className="feature-card">
            <h3>Smart Sync</h3>
            <p>Upload once and access from desktop, mobile, or browser instantly.</p>
          </div>
          <div className="feature-card">
            <h3>Share with Confidence</h3>
            <p>Send files fast while controlling who can view or download them.</p>
          </div>
        </section>

        <section className="landing-why">
          <div className="why-text">
            <h2>Why choose D's Cloud Space?</h2>
            <p>
              Designed for modern workflows, D's Cloud Space gives you a clean dashboard, secure
              file uploads, and a beautiful homepage experience powered by real-time shader animation.
            </p>
          </div>

          <div className="why-grid">
            <div className="why-item">
              <span>📦</span>
              <h4>Organize effortlessly</h4>
              <p>Keep files tidy with intuitive controls and fast search.</p>
            </div>
            <div className="why-item">
              <span>🚀</span>
              <h4>Fast performance</h4>
              <p>Optimized frontend and backend for smooth uploads and quick browsing.</p>
            </div>
            <div className="why-item">
              <span>🤝</span>
              <h4>Collaborate securely</h4>
              <p>Share files with your team or friends while keeping privacy first.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
