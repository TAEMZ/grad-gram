import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  handleEmailAuth,
  handleGoogleSignIn,
} from "../controllers/authController";
import { checkUserRoom } from "../models/authModel";
import { GraduationCap, Mail, Lock, User, ArrowRight } from "lucide-react";
import { GradGramMark } from "../components/GradGramLogo";

function AuthPage() {
  const navigate = useNavigate();
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

  const proceedAfterLogin = async (user) => {
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
      if (user) proceedAfterLogin(user);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    try {
      const user = await handleGoogleSignIn();
      if (user) proceedAfterLogin(user);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "radial-gradient(circle at 50% 10%, rgba(229, 184, 105, 0.08), transparent 60%), #080a0f",
      }}
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "40px",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-medium)",
          background: "rgba(14, 18, 26, 0.85)",
        }}
      >
        {/* Brand Mark */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <GradGramMark size={56} />
          </div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.875rem", color: "#ffffff", marginBottom: "6px" }}>
            GradGram
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {isRegister
              ? "Create your digital yearbook profile"
              : "Sign in to access your graduating cohorts"}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isRegister && (
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} color="var(--slate-400)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  name="displayName"
                  className="input-base"
                  style={{ paddingLeft: "38px" }}
                  placeholder="e.g. Alex Johnson"
                  value={form.displayName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="var(--slate-400)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="email"
                name="email"
                className="input-base"
                style={{ paddingLeft: "38px" }}
                placeholder="name@university.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="var(--slate-400)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                name="password"
                className="input-base"
                style={{ paddingLeft: "38px" }}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "8px", padding: "12px" }}
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? "Processing..." : isRegister ? "Create Account" : "Sign In to Account"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            OR
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        {/* Google SSO */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="btn btn-secondary"
          style={{ width: "100%", padding: "12px", gap: "10px" }}
          disabled={isSubmitting}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer switch */}
        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={toggleMode}
                style={{ background: "none", border: "none", color: "var(--gold-primary)", cursor: "pointer", fontWeight: 600 }}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              New to GradGram?{" "}
              <button
                type="button"
                onClick={toggleMode}
                style={{ background: "none", border: "none", color: "var(--gold-primary)", cursor: "pointer", fontWeight: 600 }}
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
