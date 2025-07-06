import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { getFirestore, doc } from "firebase/firestore";
import Magazine from "./Magazine";
import Members from "./Members";
import "./roompage.css";
import ProfileSection from "../components/ProfileSection";
import "../components/themes.css";
import BackgroundSettings from "../components/BackgroundSettings";
import { onSnapshot } from "firebase/firestore";

function RoomPage() {
  const navigate = useNavigate();
  const { roomKey } = useParams();
  const [activeTab, setActiveTab] = useState("magazine");
  const [roomData, setRoomData] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const db = getFirestore();
    const roomRef = doc(db, "rooms", roomKey);

    const unsub = onSnapshot(roomRef, (roomSnap) => {
      if (roomSnap.exists()) {
        const roomInfo = roomSnap.data();
        setRoomData({ ...roomInfo, roomKey });
        setIsCreator(roomInfo.createdBy === auth.currentUser.uid);
      } else {
        console.error("Room not found");
        navigate("/dashboard");
      }
      setLoading(false);
    });

    return () => unsub();
  }, [roomKey, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading room data...</p>
      </div>
    );

  if (!roomData) {
    return (
      <div className="error-container">
        <p>Room not found.</p>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`room-container ${darkMode ? "dark-mode" : ""}`}>
      <button className="burger-btn" onClick={toggleSidebar}>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
      </button>

      <aside className={`rooms-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          <div className="university-header">
            <div className="academic-badge">
              <h2 className="university-name">{roomData.university}</h2>
              <p className="department-name">{roomData.department}</p>
              <p className="motto">"Collaborate • Create • Inspire"</p>
            </div>
          </div>
          <div className="divider"></div>
          <ProfileSection user={auth.currentUser} />
          <div className="divider"></div>
          {isCreator && (
            <>
              <BackgroundSettings roomKey={roomKey} isCreator={isCreator} />
              <div className="divider"></div>
            </>
          )}
          <div className="room-key-section">
            <h3 className="section-title">Room Access</h3>
            <div className="key-display">
              <span className="key-label">Invitation Code:</span>
              <span className="key-value">{roomData.roomKey}</span>
            </div>
            {isCreator && (
              <p className="key-instruction">
                Share this code with classmates to join this collaborative space
              </p>
            )}
          </div>
          <div className="divider"></div>
          <nav className="sidebar-navigation">
            <h3 className="section-title">Navigation</h3>
            <button
              className={`nav-item ${activeTab === "magazine" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("magazine");
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">📰</span>
              <span className="nav-text">Magazine</span>
            </button>
            <button
              className={`nav-item ${activeTab === "members" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("members");
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Members</span>
            </button>
            <button
              className={`nav-item ${activeTab === "gallery" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("gallery");
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">🖼️</span>
              <span className="nav-text">Gallery</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="theme-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                {darkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </label>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">↩️</span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="room-content">
        <div className="room-header">
          {roomData.logo && (
            <div className="university-logo">
              <img src={roomData.logo} alt={`${roomData.university} logo`} />
            </div>
          )}
          <h1 className="room-title">{roomData.university}</h1>
          <h2 className="room-subtitle">{roomData.department}</h2>
        </div>

        {activeTab === "magazine" && (
          <Magazine
            roomId={roomData.roomKey}
            background={roomData.background}
            isCreator={isCreator}
          />
        )}
        {activeTab === "gallery" && (
          <div>
            <ExportButton roomId={roomData.roomKey} />
            <GalleryView roomId={roomData.roomKey} />
          </div>
        )}
        {activeTab === "members" && <Members roomId={roomData.roomKey} />}
      </main>
    </div>
  );
}

export default RoomPage;
