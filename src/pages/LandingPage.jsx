import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  BookOpen,
  Music,
  Feather,
  Compass,
  Camera,
  Hourglass,
  X,
  Mail,
  Lock,
  User,
  CheckCircle2,
  ChevronRight,
  Shield,
  Award,
} from "lucide-react";
import "./landing-page.css";
import {
  handleEmailAuth,
  handleGoogleSignIn,
} from "../controllers/authController";
import { getCohortLogo } from "../utils/cohortLogos";
import { GradGramMark } from "../components/GradGramLogo";

const FEATURED_COHORTS = [
  { name: "Hawassa University", dept: "Mechanical Engineering", year: "2026", key: "hawassa" },
  { name: "Harvard University", dept: "Faculty of Arts & Sciences", year: "2026", key: "harvard" },
  { name: "Stanford University", dept: "Computer Science", year: "2026", key: "stanford" },
  { name: "University of Cambridge", dept: "Trinity College", year: "2026", key: "cambridge" },
  { name: "University of Oxford", dept: "Balliol College", year: "2026", key: "oxford" },
  { name: "MIT", dept: "Electrical Engineering", year: "2026", key: "mit" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  const toggleMode = () => setIsRegister((v) => !v);
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const proceedAfterLogin = () => {
    setAuthModalOpen(false);
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return alert("Email and Password are required");
    }
    setIsSubmitting(true);
    try {
      const user = await handleEmailAuth(form, isRegister);
      if (user) proceedAfterLogin();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    try {
      const user = await handleGoogleSignIn();
      if (user) proceedAfterLogin();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-root">
      <div className="landing-stardust" />

      {/* Sovereign Top Navigation */}
      <header className="landing-navbar">
        <a href="/" className="landing-brand" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <GradGramMark size={38} />
          <span className="landing-brand-name">GRADGRAM</span>
        </a>

        <nav className="landing-nav-links">
          <a href="#proclamation" className="landing-nav-link">Overview</a>
          <a href="#sash-pathway" className="landing-nav-link">How It Works</a>
          <a href="#cohorts-gallery" className="landing-nav-link">Universities</a>
        </nav>

        <button
          className="landing-signin-btn"
          onClick={() => {
            setIsRegister(false);
            setAuthModalOpen(true);
          }}
        >
          <span>Sign In</span>
          <ArrowRight size={15} />
        </button>
      </header>

      {/* Main Hero: Atmospheric Cathedral Backdrop & Interactive Open Folio */}
      <section className="landing-hero" id="proclamation">
        <div className="landing-hero-backdrop" />

        <div className="landing-hero-content">
          <h1>
            Your College Memories, <span className="gold-shimmer">All in One Place</span>
          </h1>

          <p className="hero-desc">
            Collect graduation photos, sign your friends' yearbooks, and stay connected with your graduating class wherever life takes you.
          </p>

          {/* Centerpiece: The Open Folio Centerpiece (Zero Cards) */}
          <div
            className="hero-folio-stage"
            onClick={() => {
              setIsRegister(true);
              setAuthModalOpen(true);
            }}
            title="Click to open yearbook"
          >
          {/* Circular Orbit of Verified University Crests */}
          <div className="crest-orbit-ring">
            {FEATURED_COHORTS.map((c) => {
              const crest = getCohortLogo(c.key);
              return (
                <div key={c.key} className="crest-orbit-node" title={c.name}>
                  {crest ? (
                    <img src={crest} alt={c.name} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  ) : (
                    <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 800, color: "#fbbf24" }}>
                      {c.name[0]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3D Open Commemorative Leather & Parchment Book */}
          <div className="open-folio-sculpture">
            {/* Scarlet Honors Ribbon Bookmark */}
            <div className="folio-silk-ribbon" />

            {/* Left Page: Proclamation & Seal */}
            <div className="folio-page-half">
              <div className="folio-page-header">
                <span>Class of 2026</span>
                <span>Hawassa University</span>
              </div>

              <div className="folio-proclamation-seal">
                <img
                  src={getCohortLogo("hawassa")}
                  alt="Hawassa University"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              </div>

              <h2>To the Graduating Class</h2>
              <p>
                Four unforgettable years, endless late nights, and lifelong friendships. This yearbook is our place to celebrate everything we accomplished together and keep in touch as we start our next chapters.
              </p>

              <div className="folio-sign-entry">
                <em>"From freshman orientation to walking across the stage—we made it through together."</em>
                <cite>— Department of Mechanical Engineering</cite>
              </div>
            </div>

            {/* Right Page: Classmate Register */}
            <div className="folio-page-half" style={{ borderLeft: "1px dashed rgba(180, 83, 9, 0.25)" }}>
              <div className="folio-page-header">
                <span>Classmate Notes & Messages</span>
                <span>Class of 2026</span>
              </div>

              <h2 style={{ fontSize: "1.25rem" }}>Leave Your Mark</h2>
              <p style={{ fontSize: "0.8125rem", marginBottom: 12 }}>
                Sign your classmates' yearbooks, write personal notes, and share where life is taking you.
              </p>

              <div className="folio-sign-entry" style={{ background: "rgba(30, 58, 138, 0.06)", borderLeftColor: "#1e3a8a" }}>
                <em>"Starting my masters in renewable energy next fall. Can't wait to see what everyone does next!"</em>
                <cite style={{ color: "#1e3a8a" }}>Dawit Tadesse</cite>
              </div>

              <div className="folio-sign-entry" style={{ background: "rgba(22, 101, 52, 0.06)", borderLeftColor: "#15803d" }}>
                <em>"Shoutout to the late-night study crew at the central library—we actually made it!"</em>
                <cite style={{ color: "#15803d" }}>Selamawit Kebede</cite>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Section 2: The S-Curved Academic Ribbon Pathway (NO RECTANGLE CARDS) */}
      <section className="landing-pathway-section" id="sash-pathway">
        <div className="section-proclamation-header">
          <h2>Everything You Need in One Place</h2>
          <p>
            More than just photos on a screen—a real graduation keepsake built for your whole class.
          </p>
        </div>

        <div className="sash-pathway-flow">
          {/* Golden Center Sash Spine */}
          <div className="sash-central-spine" />

          {/* Milestone 1: Collect & Share Graduation Photos */}
          <div className="sash-milestone-row left-side">
            <div className="sash-story-pod">
              <div className="pod-roman-rank">01</div>
              <h3>Collect & Share Graduation Photos</h3>
              <p>
                Gather all your class memories, senior portraits, and campus milestones in one collaborative album for your entire cohort.
              </p>
              <div className="pod-highlight-tag">
                <Camera size={14} />
                <span>Shared Photo Galleries</span>
              </div>
            </div>
            <div className="sash-wax-seal">
              <Camera size={24} />
            </div>
          </div>

          {/* Milestone 2: Sign Senior Messages & Autographs */}
          <div className="sash-milestone-row right-side">
            <div className="sash-story-pod">
              <div className="pod-roman-rank">02</div>
              <h3>Sign Senior Messages & Autographs</h3>
              <p>
                Leave personal farewells, inside jokes, and good-luck wishes directly in your friends' digital autograph books.
              </p>
              <div className="pod-highlight-tag">
                <Feather size={14} />
                <span>Personal Autographs</span>
              </div>
            </div>
            <div className="sash-wax-seal">
              <Feather size={24} />
            </div>
          </div>

          {/* Milestone 3: Lock Memories in a Reunion Time Capsule */}
          <div className="sash-milestone-row left-side">
            <div className="sash-story-pod">
              <div className="pod-roman-rank">03</div>
              <h3>Lock Memories in a Reunion Time Capsule</h3>
              <p>
                Seal away predictions, letters to your future selves, and throwback photos to unlock together at your next reunion.
              </p>
              <div className="pod-highlight-tag">
                <Hourglass size={14} />
                <span>Reunion Time Capsule</span>
              </div>
            </div>
            <div className="sash-wax-seal">
              <Hourglass size={24} />
            </div>
          </div>

          {/* Milestone 4: Stay Connected on the Alumni Map */}
          <div className="sash-milestone-row right-side">
            <div className="sash-story-pod">
              <div className="pod-roman-rank">04</div>
              <h3>Stay Connected on the Alumni Map</h3>
              <p>
                Drop a pin to show where you're starting your career or grad school, and easily find classmates living in the same city.
              </p>
              <div className="pod-highlight-tag">
                <Compass size={14} />
                <span>Global Graduate Network</span>
              </div>
            </div>
            <div className="sash-wax-seal">
              <Compass size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Panoramic Circular Cohort Shields (NO RECTANGLE CARDS) */}
      <section className="landing-cohorts-section" id="cohorts-gallery">
        <div className="section-proclamation-header">
          <h2>Featured Universities</h2>
          <p>
            Explore graduating classes from universities around the world.
          </p>
        </div>

        <div className="cohorts-panoramic-track">
          {FEATURED_COHORTS.map((cohort) => {
            const logo = getCohortLogo(cohort.key);
            return (
              <div
                key={cohort.key}
                className="cohort-shield-orb"
                onClick={() => {
                  setIsRegister(false);
                  setAuthModalOpen(true);
                }}
              >
                <div className="cohort-orb-disc">
                  {logo ? (
                    <img src={logo} alt={cohort.name} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  ) : (
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "1.6rem", fontWeight: 800, color: "#fbbf24" }}>
                      {cohort.name[0]}
                    </span>
                  )}
                </div>
                <h4>{cohort.name}</h4>
                <span>{cohort.dept}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Call to Action (Zero Rectangle Cards) */}
      <section className="landing-seal-cta">
        <div className="sash-wax-seal" style={{ position: "relative", left: "auto", transform: "none", margin: "0 auto 24px" }}>
          <GraduationCap size={28} />
        </div>
        <h2>Ready to Start Your Yearbook?</h2>
        <p>
          Join your class, sign your friends' yearbooks, and save your college memories forever.
        </p>
        <button
          className="hero-primary-btn"
          onClick={() => {
            setIsRegister(true);
            setAuthModalOpen(true);
          }}
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>
      </section>

      {/* ==========================================================================
         Integrated Authentication Modal
         ========================================================================== */}
      {authModalOpen && (
        <div className="auth-modal-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={() => setAuthModalOpen(false)}>
              <X size={18} />
            </button>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <GradGramMark size={56} />
              </div>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "#ffffff", marginBottom: 6 }}>
                {isRegister ? "Create Your Account" : "Sign In"}
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                {isRegister
                  ? "Sign up to join your class yearbook"
                  : "Sign in to access your yearbooks"}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {isRegister && (
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", color: "#94a3b8", marginBottom: 6 }}>
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} color="#64748b" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      name="displayName"
                      className="input-base"
                      style={{ paddingLeft: 40, width: "100%", borderRadius: 9999 }}
                      placeholder="Jane Doe"
                      value={form.displayName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", color: "#94a3b8", marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#64748b" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email"
                    name="email"
                    className="input-base"
                    style={{ paddingLeft: 40, width: "100%", borderRadius: 9999 }}
                    placeholder="graduate@university.edu"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", color: "#94a3b8", marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="#64748b" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="password"
                    name="password"
                    className="input-base"
                    style={{ paddingLeft: 40, width: "100%", borderRadius: 9999 }}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="hero-primary-btn"
                style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "Processing..." : isRegister ? "Create Account" : "Sign In to Account"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="hero-secondary-btn"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={isSubmitting}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "#94a3b8" }}>
              {isRegister ? (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    style={{ background: "none", border: "none", color: "#fbbf24", cursor: "pointer", fontWeight: 700 }}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  First time visiting?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    style={{ background: "none", border: "none", color: "#fbbf24", cursor: "pointer", fontWeight: 700 }}
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
