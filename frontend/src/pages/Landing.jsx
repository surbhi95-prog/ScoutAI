import { NavLink, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Landing.css';
import { useState } from 'react';

function Landing() {
  const isLoggedIn = localStorage.getItem("access_token");
  const [userName,setUserName] = useState(
    localStorage.getItem("user_name")
  );


  const navigate = useNavigate();

  const handleVerify = () => {
    console.log('[ScoutAI] Navigating to Verify Job page');
    navigate('/verify');
  };

  const handleGetStarted = () => {
    console.log('[ScoutAI] Navigating to Signup page');
    navigate('/signup');
  };

  const handleHowItWorks = () => {
    console.log('[ScoutAI] Scrolling to How It Works section');
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  // duplicate items so the ticker loops seamlessly
  const tickerItems = [
    { icon: '🔎', text: 'AI-Powered Analysis' },
    { icon: '🌐', text: 'Company Verification' },
    { icon: '📧', text: 'Email Domain Check' },
    { icon: '🛡️', text: 'Scam Detection' },
    { icon: '⚡', text: 'Instant Results' },
    { icon: '🔒', text: 'Privacy First' },
  ];
  const doubled = [...tickerItems, ...tickerItems];

  return (
    
    <div className="landing">
      {/* ── NAVBAR ───────────────────────────────────────────── */}
      {isLoggedIn? (
        <Navbar/>
      ):
        (
          <nav className="landing-nav">
        <div className="nav-logo">
          <div className="nav-logo-dot" />
          ScoutAI
        </div>

        <div className="nav-links">
          <a href="#how-it-works" onClick={e => { e.preventDefault(); handleHowItWorks(); }}>
            How It Works
          </a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <button className="nav-login-btn" onClick={() => { console.log('[ScoutAI] Navigating to Login'); navigate('/login'); }}>
            Login
          </button>
          <button className="nav-signup-btn" onClick={() => { console.log('[ScoutAI] Navigating to Signup'); navigate('/signup'); }}>
            Sign Up
          </button>
        </div>
      </nav>
        )}

      {/* ── HERO ─────────────────────────────────────────────── */}
      <main className="hero">

        {/* Left — copy */}
        <section className="hero-content">

          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Job Verification
          </div>

          <h1>
            Don't Let a Fake Job
            <br />
            <span className="highlight">Steal Your Future.</span>
          </h1>

          <p className="hero-sub">
            Verify job offers before you trust them. ScoutAI analyzes
            companies, job listings, recruiter emails, and scam signals
            — so you can job hunt with confidence.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleVerify}>
              Verify a Job →
            </button>
            <button className="btn-secondary" onClick={handleHowItWorks}>
              See How It Works
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">12k+</span>
              <span className="stat-label">Jobs Verified</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Accuracy</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3.4k</span>
              <span className="stat-label">Scams Caught</span>
            </div>
          </div>
        </section>


        {/* Right — visual cards */}
        <section className="hero-visual">

          {/* Floating stickers */}
          <span className="sticker sticker-1">🎯</span>
          <span className="sticker sticker-2">🔐</span>
          <span className="sticker sticker-3">⚡</span>

          {/* Main trust card */}
          <div className="trust-card">
            <div className="card-top">
              <span className="card-label">VERIFICATION REPORT</span>
              <span className="card-verified">
                <span className="card-verified-dot" />
                VERIFIED
              </span>
            </div>

            <div className="score-ring">
              <span className="score-number">92</span>
              <span className="score-sub">TRUST SCORE</span>
            </div>

            <div className="card-status">
              ✓&nbsp; Likely Genuine — Safe to Proceed
            </div>

            <div className="card-signals">
              {[
                'Official job listing found',
                'Company website verified',
                'Email domain matches',
                'No scam indicators detected',
              ].map((s) => (
                <div className="signal-row" key={s}>
                  <span className="signal-check">✓</span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Mini alert card */}
          <div className="mini-card">
            <span className="mini-card-icon">🚨</span>
            <div className="mini-card-text">
              <span className="mini-card-title">Suspicious offer blocked</span>
              <span className="mini-card-sub">recruiter@fakecompany-mail.com · Score 14</span>
            </div>
          </div>

        </section>
      </main>


      {/* ── TICKER ───────────────────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {doubled.map((item, i) => (
            <div className="ticker-item" key={i}>
              <span>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>


      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="how-section">
        <div className="section-tag">✦ How It Works</div>
        <h2>How ScoutAI Protects You</h2>
        <p className="section-sub">Multiple signals. One clear answer.</p>

        <div className="feature-grid">
          {[
            { icon: '🔎', title: 'Analyze', desc: 'Paste a job title, URL, or recruiter email. Our AI scans dozens of fraud signals in seconds.' },
            { icon: '🌐', title: 'Verify',  desc: 'We cross-check company websites, official job boards, and email domains automatically.' },
            { icon: '🛡️', title: 'Protect', desc: 'Get a clear Trust Score with reasons and a recommendation — before you apply or respond.' },
          ].map(({ icon, title, desc }) => (
            <div className="feature-card" key={title}>
              <div className="feature-icon-wrap">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ── CTA ──────────────────────────────────────────────── */}
      <section id="about" className="cta-section">
        <span className="cta-sticker cta-sticker-1">🛡️</span>
        <span className="cta-sticker cta-sticker-2">🎯</span>

        <h2>One suspicious message is all it takes.</h2>
        <p>Verify before you trust. It's free and takes 30 seconds.</p>

        <button className="btn-primary" onClick={handleGetStarted}>
          Get Started for Free →
        </button>
      </section>

    </div>
  );
}

export default Landing;