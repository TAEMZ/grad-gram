import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  handleEmailAuth,
  handleGoogleSignIn,
} from "../controllers/authController";
import { checkUserRoom } from "../models/authModel"; // <-- import created

function AuthPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  const toggleMode = () => setIsRegister((v) => !v);
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const proceedAfterLogin = async (user) => {
    const roomData = await checkUserRoom(user.uid);
    if (roomData) {
      navigate("/dashboard"); // Instead of navigating straight to room, land on Dashboard
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return alert("Email and Password are required");
    }
    const user = await handleEmailAuth(form, isRegister);
    if (user) proceedAfterLogin(user);
  };

  const handleGoogleAuth = async () => {
    const user = await handleGoogleSignIn();
    if (user) proceedAfterLogin(user);
  };

  return (
    <div className="page-container">
      <div className="glass-card animate-fade-in text-center">
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>GradGram</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {isRegister ? "Start your collaborative journey" : "Welcome back to your memories"}
        </p>

        <form onSubmit={handleSubmit} style={{ background: 'transparent', boxShadow: 'none', padding: 0, color: 'inherit' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            {isRegister ? "Create Account" : "Sign In"}
          </h2>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {isRegister && (
            <input
              type="text"
              name="displayName"
              placeholder="Your Full Name"
              value={form.displayName}
              onChange={handleChange}
              required
            />
          )}

          <button type="submit">
            {isRegister ? "Register Now" : "Sign In"}
          </button>

          <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.127-.843 2.083-1.797 2.715v2.257h2.91c1.703-1.567 2.683-3.874 2.683-6.613z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.187l-2.91-2.257c-.806.54-1.837.86-3.046.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957a8.991 8.991 0 000 8.088l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.049.957 4.956L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ marginTop: '2rem', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button type="button" onClick={toggleMode} className="toggle-link">
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
