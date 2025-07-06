// src/controllers/authController.js
import {
  registerUserWithEmail,
  loginUserWithEmail,
  signInWithGoogle,
} from "../models/authModel";

export const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithGoogle();
    if (result) {
      alert("Signed in with Google!");
      return result.user; // Return the user object
    }
    return null;
  } catch (err) {
    console.error("Google sign-in error:", err);
    alert(`Sign-in failed: ${err.message}`);
    return null;
  }
};

export const handleEmailAuth = async (form, isRegister) => {
  try {
    if (isRegister) {
      const userCredential = await registerUserWithEmail(form);
      alert("Registered successfully!");
      return userCredential.user; // Return the user object
    } else {
      const userCredential = await loginUserWithEmail(form);
      alert("Logged in successfully!");
      return userCredential.user; // Return the user object
    }
  } catch (err) {
    console.error("Auth error:", err);

    let message = err.message;
    if (err.code === "auth/network-request-failed") {
      message = "Network error. Please check your internet connection.";
    } else if (err.code === "auth/email-already-in-use") {
      message = "This email is already registered.";
    }

    alert(message);
    return null;
  }
};
