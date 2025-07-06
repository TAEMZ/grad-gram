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
      <form onSubmit={handleSubmit}>
        <h2 style={{ textAlign: "center" }}>
          {isRegister ? "Register" : "Login"}
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
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
            placeholder="Your Name"
            value={form.displayName}
            onChange={handleChange}
            required
          />
        )}

        <button type="submit">{isRegister ? "Register" : "Login"}</button>

        <button
          type="button"
          onClick={handleGoogleAuth}
          style={{ backgroundColor: "#ef4444", marginTop: "10px" }}
        >
          Sign in with Google
        </button>

        <p style={{ textAlign: "center", fontSize: "14px" }}>
          {isRegister ? "Already have an account?" : "New here?"}
          <button type="button" onClick={toggleMode} className="toggle-link">
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default AuthPage;
