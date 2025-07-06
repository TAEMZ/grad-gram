// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

export default function PrivateRoute({ children }) {
  if (!auth.currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
}
