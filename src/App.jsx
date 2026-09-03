import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import RoomPage from "./pages/Roompage";
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      // src/App.jsx
      <Route
        path="/room/:roomKey"
        element={
          <PrivateRoute>
            <RoomPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
