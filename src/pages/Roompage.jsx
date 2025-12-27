import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { getFirestore, doc } from "firebase/firestore";
import Magazine from "./Magazine";
import Members from "./Members";
import Awards from "./Awards";
import RollCall from "./RollCall";
import "./roompage.css";
import ProfileSection from "../components/ProfileSection";
import "../components/themes.css";
import BackgroundSettings from "../components/BackgroundSettings";
import { onSnapshot } from "firebase/firestore";

function RoomPage() {
  // ... existing code ...

  // inside return statement, where tab content is rendered:

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
  const [curtainActive, setCurtainActive] = useState(false);

  useEffect(() => {
    // Trigger curtain animation on mount
    setCurtainActive(true);
    const timer = setTimeout(() => setCurtainActive(false), 2000); // Cleanup class after animation
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (roomData?.accentColor) {
      document.documentElement.style.setProperty('--room-accent', roomData.accentColor);
      document.documentElement.style.setProperty('--room-glow', `${roomData.accentColor}26`); // 15% opacity
    } else {
      document.documentElement.style.setProperty('--room-accent', 'var(--accent-primary)');
    }
  }, [roomData]);

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
    <div className={`room-container ${curtainActive ? 'curtain-active' : ''}`}>
      {/* Curtain Transition */}
      <div className="curtain-overlay">
        <div className="curtain-panel"></div>
        <div className="curtain-panel right"></div>
      </div>

      {/* Burger button */}
      <button className={`burger-btn ${sidebarOpen ? "open" : ""}`} onClick={toggleSidebar}>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
      </button>

      {/* Sidebar */}
      <aside className={`rooms-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          <div className="academic-badge animate-fade-in">
            <h2 className="university-name">{roomData.university}</h2>
            <p className="department-name">{roomData.department}</p>
          </div>

          <nav className="sidebar-navigation">
            <button
              className={`nav-item ${activeTab === "magazine" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("magazine");
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">✨</span>
              <span className="nav-text">Magazine</span>
            </button>
            <button
              className={`nav-item ${activeTab === "members" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("members");
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-text">Classmates</span>
            </button>
            {/* Memories Tab Removed as per request */}
            <button
              className={`nav-item ${activeTab === "awards" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("awards");
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">🏆</span>
              <span className="nav-text">Superlatives</span>
            </button>
            <button
              className={`nav-item ${activeTab === "rollcall" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("rollcall");
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">📜</span>
              <span className="nav-text">Roll Call</span>
            </button>
          </nav>

          <div className="sidebar-divider"></div>

          <div className="room-key-section">
            <h3 className="section-title">Invite Link</h3>
            <div className="key-display" title="Click to copy">
              <span className="key-value">{roomData.roomKey}</span>
            </div>
          </div>

          {/* Feature 1: Commencement Countdown */}
          <div className="countdown-widget animate-fade-in">
            <h3 className="section-title">Time Until Graduation</h3>
            <div className="countdown-display">
              <div className="time-unit">
                <span className="unit-value">142</span>
                <span className="unit-label">Days</span>
              </div>
              <div className="time-unit">
                <span className="unit-value">08</span>
                <span className="unit-label">Hrs</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Wisdom Widget */}
          <div className="wisdom-widget animate-fade-in">
            <h3 className="section-title">Daily Wisdom</h3>
            <p className="wisdom-text">"Your time is limited, so don't waste it living someone else's life."</p>
            <small className="wisdom-author">– Steve Jobs</small>
          </div>

          {isCreator && (
            <div className="creator-controls">
              <h3 className="section-title">Atmosphere</h3>
              <BackgroundSettings roomKey={roomKey} isCreator={isCreator} />
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          {/* Feature 1: Profile Detail (Next Chapter) */}
          <div className="alumni-tag">
            <span className="tag-label">Next Chapter</span>
            <span className="tag-value">Pursuing Excellence</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="nav-item back-btn" style={{ marginBottom: '8px', width: '100%', justifyContent: 'center' }}>
            <span className="nav-icon">⬅️</span>
            <span className="nav-text">Back to Hall</span>
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="room-content">
        <header className="room-header animate-fade-in">
          {/* Feature 3: Year Watermark */}
          <div className="year-watermark">Class of '24</div>
          {roomData.logo && (
            <div className="university-logo">
              <img src={roomData.logo} alt="Logo" />
            </div>
          )}
          <h1 className="room-title">{roomData.university}</h1>
          <h2 className="room-subtitle">{roomData.department}</h2>
        </header>

        <div className="room-tab-content animate-fade-in" style={{ padding: '40px' }}>
          {activeTab === "magazine" && (
            <Magazine
              roomId={roomData.roomKey}
              background={roomData.background}
              isCreator={isCreator}
            />
          )}
          {activeTab === "members" && <Members roomId={roomData.roomKey} />}
          {activeTab === "awards" && <Awards roomId={roomData.roomKey} />}
          {activeTab === "rollcall" && <RollCall roomId={roomData.roomKey} />}
        </div>
      </main>
    </div>
  );
}

export default RoomPage;
