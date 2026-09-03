import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  getDocs,
} from "firebase/firestore";

// 3D Physical & Spatial Centerpieces
import YearbookBook from "../components/YearbookBook";
import ScrapbookCanvas from "../components/ScrapbookCanvas";

// Core Interactive Viewports
import Magazine from "./Magazine";
import Autographs from "./Autographs";
import AlumniMap from "./AlumniMap";
import CapTossCelebration from "../components/CapTossCelebration";
import TimeCapsule from "./TimeCapsule";
import Chat from "./Chat";
import Members from "./Members";
import Awards from "./Awards";
import RollCall from "./RollCall";

// Components
import QRBadgeModal from "../components/QRBadgeModal";
import ClassAnthem from "../components/ClassAnthem";
import BackgroundSettings from "../components/BackgroundSettings";
import { getCohortLogo } from "../utils/cohortLogos";

// High-precision Lucide Icons (Zero Raw Emojis)
import {
  BookOpen,
  Layers,
  Feather,
  Compass,
  GraduationCap,
  Hourglass,
  Camera,
  MessageSquare,
  Users,
  Trophy,
  Scroll,
  ArrowLeft,
  Copy,
  Check,
  LogOut,
  Menu,
  X,
  Clock,
  Sparkles,
  Share2,
  QrCode,
} from "lucide-react";
import "./roompage.css";

const GRADUATION_QUOTES = [
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
];

function RoomPage() {
  const navigate = useNavigate();
  const { roomKey } = useParams();
  const [activeTab, setActiveTab] = useState("book");
  const [roomData, setRoomData] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, completed: false });

  const db = getFirestore();

  // 1. Subscribe to Room document & fetch members + memories
  useEffect(() => {
    const roomRef = doc(db, "rooms", roomKey);

    const unsubRoom = onSnapshot(roomRef, async (roomSnap) => {
      if (roomSnap.exists()) {
        const roomInfo = roomSnap.data();
        setRoomData({ ...roomInfo, roomKey });
        setIsCreator(roomInfo.createdBy === auth.currentUser?.uid);

        // Fetch members for 3D Book roster
        try {
          const memberCol = collection(db, "rooms", roomKey, "members");
          const memberSnap = await getDocs(memberCol);
          const loadedMembers = await Promise.all(
            memberSnap.docs.map(async (memDoc) => {
              const uSnap = await getDocs(collection(db, "users"));
              const uData = uSnap.docs.find((d) => d.id === memDoc.id)?.data() || {};
              return {
                uid: memDoc.id,
                displayName: uData.displayName || "Classmate",
                nextChapter: uData.nextChapter || "Graduate",
              };
            })
          );
          setMembers(loadedMembers);
        } catch (e) {}

        // Fetch posts for 3D Book memories
        try {
          const postsCol = collection(db, "rooms", roomKey, "posts");
          const postsSnap = await getDocs(postsCol);
          setPosts(postsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (e) {}
      } else {
        console.error("Room not found");
        navigate("/dashboard");
      }
      setLoading(false);
    });

    return () => unsubRoom();
  }, [roomKey, navigate, db]);

  // 2. Live Countdown Calculator
  useEffect(() => {
    const calculateCountdown = () => {
      const targetDate = roomData?.commencementDate
        ? new Date(roomData.commencementDate).getTime()
        : new Date("2026-05-30").getTime();

      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, completed: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft({ days, hours, completed: false });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 60000);
    return () => clearInterval(timer);
  }, [roomData]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleCopyKey = () => {
    if (roomData?.roomKey) {
      navigator.clipboard.writeText(roomData.roomKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const dailyQuote = GRADUATION_QUOTES[dayOfYear % GRADUATION_QUOTES.length];

  if (loading) {
    return (
      <div className="room-layout" style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="metric-icon-box" style={{ margin: "0 auto 16px", width: 52, height: 52 }}>
            <GraduationCap size={28} />
          </div>
          <h3 style={{ color: "#fff", marginBottom: 6 }}>Loading Cohort Suite</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading yearbook...</p>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="room-layout" style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h3 style={{ color: "#fff", marginBottom: 12 }}>Room Not Found</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>This graduation room may have been deleted or the key is invalid.</p>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  const cohortLogo = getCohortLogo(roomData);

  return (
    <div className="room-layout">
      {/* Printable QR Passkey Modal */}
      <QRBadgeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        roomData={roomData}
      />

      {/* Mobile Topbar */}
      <header className="room-topbar">
        <button className="back-link-btn" onClick={() => navigate("/dashboard")} style={{ margin: 0 }}>
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>
        <button
          className="topbar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Navigation"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Backdrop for Mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Refined Cohort Navigation Sidebar */}
      <aside className={`room-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="room-sidebar-header">
          <button className="back-link-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <div className="cohort-identity" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              className="cohort-sidebar-crest"
              style={{
                position: "relative",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1.5px solid rgba(229, 184, 105, 0.5)",
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                background: "var(--bg-surface-elevated)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "var(--gold-primary)",
                  zIndex: 1,
                  userSelect: "none",
                }}
              >
                {roomData.university?.[0]?.toUpperCase() || "U"}
              </span>
              {cohortLogo && (
                <img
                  src={cohortLogo}
                  alt={roomData.university}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  style={{ position: "relative", zIndex: 2, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              )}
            </div>
            <div>
              <h2 className="cohort-uni-title">{roomData.university}</h2>
              <span className="cohort-dept-subtitle">{roomData.department}</span>
            </div>
          </div>
        </div>

        <div className="room-nav-section">
          {/* Real Audio Class Anthem Player & Uploader */}
          <ClassAnthem
            roomId={roomData.roomKey}
            anthemUrl={roomData.anthemUrl}
            anthemTitle={roomData.anthemTitle}
            isCreator={isCreator}
          />

          {/* Navigation Menu */}
          <div>
            <div className="nav-section-title">Physical Artifacts</div>
            <ul className="room-nav-menu">
              <li>
                <button
                  className={`room-nav-item ${activeTab === "book" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("book");
                    setSidebarOpen(false);
                  }}
                >
                  <BookOpen size={16} />
                  <span>Yearbook View</span>
                </button>
              </li>
              <li>
                <button
                  className={`room-nav-item ${activeTab === "tabletop" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("tabletop");
                    setSidebarOpen(false);
                  }}
                >
                  <Layers size={16} />
                  <span>Scrapbook Canvas</span>
                </button>
              </li>
              <li>
                <button
                  className={`room-nav-item ${activeTab === "autographs" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("autographs");
                    setSidebarOpen(false);
                  }}
                >
                  <Feather size={16} />
                  <span>Sign My Yearbook</span>
                </button>
              </li>
              <li>
                <button
                  className={`room-nav-item ${activeTab === "alumni" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("alumni");
                    setSidebarOpen(false);
                  }}
                >
                  <Compass size={16} />
                  <span>Alumni Relocation Map</span>
                </button>
              </li>
              <li>
                <button
                  className={`room-nav-item ${activeTab === "timecapsule" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("timecapsule");
                    setSidebarOpen(false);
                  }}
                >
                  <Hourglass size={16} />
                  <span>5-Year Reunion Vault</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="nav-section-title">Class Collaboration</div>
            <ul className="room-nav-menu">
              <li>
                <button
                  className={`room-nav-item ${activeTab === "magazine" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("magazine");
                    setSidebarOpen(false);
                  }}
                >
                  <Camera size={16} />
                  <span>Memory Feed & Add</span>
                </button>
              </li>
              <li>
                <button
                  className={`room-nav-item ${activeTab === "chat" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("chat");
                    setSidebarOpen(false);
                  }}
                >
                  <MessageSquare size={16} />
                  <span>Cohort Discussion</span>
                </button>
              </li>
              <li>
                <button
                  className={`room-nav-item ${activeTab === "members" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("members");
                    setSidebarOpen(false);
                  }}
                >
                  <Users size={16} />
                  <span>Class Directory</span>
                </button>
              </li>
              <li>
                <button
                  className={`room-nav-item ${activeTab === "awards" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("awards");
                    setSidebarOpen(false);
                  }}
                >
                  <Trophy size={16} />
                  <span>Superlatives</span>
                </button>
              </li>
              <li>
                <button
                  className={`room-nav-item ${activeTab === "rollcall" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("rollcall");
                    setSidebarOpen(false);
                  }}
                >
                  <Scroll size={16} />
                  <span>Roll Call Credits</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Invite Key & QR Widget */}
          <div className="sidebar-widget-box">
            <div className="widget-title">
              <Share2 size={12} />
              <span>Room Onboarding</span>
            </div>
            <div
              className="invite-key-pill"
              onClick={handleCopyKey}
              title="Click to copy invite passkey"
            >
              <span>{roomData.roomKey.slice(0, 16)}...</span>
              {copiedKey ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => setIsQRModalOpen(true)}
            >
              <QrCode size={14} />
              <span>Show QR Badge</span>
            </button>
          </div>

          {/* Commencement Countdown */}
          <div className="sidebar-widget-box">
            <div className="widget-title">
              <Clock size={12} />
              <span>Commencement Countdown</span>
            </div>
            <div className="countdown-box">
              {timeLeft.completed ? (
                <div style={{ color: "var(--gold-light)", fontSize: "0.875rem", fontWeight: 600 }}>
                  Graduated
                </div>
              ) : (
                <>
                  <div style={{ textAlign: "center" }}>
                    <div className="countdown-digit">{timeLeft.days}</div>
                    <div className="countdown-unit">Days</div>
                  </div>
                  <div style={{ color: "var(--border-medium)", fontSize: "1.2rem" }}>:</div>
                  <div style={{ textAlign: "center" }}>
                    <div className="countdown-digit">
                      {timeLeft.hours.toString().padStart(2, "0")}
                    </div>
                    <div className="countdown-unit">Hours</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Daily Wisdom Widget */}
          <div className="sidebar-widget-box">
            <div className="widget-title">
              <Sparkles size={12} />
              <span>Daily Wisdom</span>
            </div>
            <p className="quote-widget-text">"{dailyQuote.text}"</p>
            <div className="quote-widget-author">– {dailyQuote.author}</div>
          </div>

          {/* Atmosphere Settings */}
          {isCreator && (
            <div className="sidebar-widget-box">
              <div className="widget-title">
                <span>Room Atmosphere</span>
              </div>
              <BackgroundSettings roomKey={roomKey} isCreator={isCreator} />
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Cohort Viewport */}
      <main className="room-main">
        <header className="room-hero-banner">
          <div className="room-hero-left">
            <div
              className="room-hero-logo"
              style={{
                position: "relative",
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "2px solid rgba(229, 184, 105, 0.6)",
                background: "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.6), inset 0 0 8px rgba(0, 0, 0, 0.8)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--gold-primary)",
                  zIndex: 1,
                  userSelect: "none",
                }}
              >
                {roomData.university?.[0]?.toUpperCase() || "U"}
              </span>
              {cohortLogo && (
                <img
                  src={cohortLogo}
                  alt={roomData.university}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                    display: "block",
                  }}
                />
              )}
            </div>
            <div className="room-hero-titles">
              <h1>{roomData.university}</h1>
              <h2>{roomData.department} · Class of {roomData.gradYear || "2026"} Suite</h2>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className={`btn ${activeTab === "book" ? "btn-primary" : "btn-secondary"} btn-sm`}
              onClick={() => setActiveTab("book")}
            >
              <BookOpen size={14} />
              <span>3D Book</span>
            </button>
            <button
              className={`btn ${activeTab === "tabletop" ? "btn-primary" : "btn-secondary"} btn-sm`}
              onClick={() => setActiveTab("tabletop")}
            >
              <Layers size={14} />
              <span>Tabletop</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsQRModalOpen(true)}>
              <QrCode size={14} />
              <span>Pass Badge</span>
            </button>
          </div>
        </header>

        <section className="room-viewport-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "book" && (
                <YearbookBook
                  roomData={roomData}
                  members={members}
                  posts={posts}
                  onOpenAutographs={() => setActiveTab("autographs")}
                  onOpenAlumni={() => setActiveTab("alumni")}
                  onOpenSuperlatives={() => setActiveTab("awards")}
                  onOpenTimeCapsule={() => setActiveTab("timecapsule")}
                />
              )}

              {activeTab === "tabletop" && (
                <ScrapbookCanvas posts={posts} />
              )}

              {activeTab === "magazine" && (
                <Magazine
                  roomId={roomData.roomKey}
                  background={roomData.background}
                  isCreator={isCreator}
                />
              )}

              {activeTab === "autographs" && <Autographs roomId={roomData.roomKey} />}

              {activeTab === "alumni" && <AlumniMap roomId={roomData.roomKey} />}

              {activeTab === "captoss" && (
                <CapTossCelebration
                  roomId={roomData.roomKey}
                  universityName={roomData.university}
                  gradYear={roomData.gradYear}
                />
              )}

              {activeTab === "timecapsule" && (
                <TimeCapsule
                  roomId={roomData.roomKey}
                  gradYear={roomData.gradYear}
                />
              )}

              {activeTab === "chat" && <Chat roomId={roomData.roomKey} />}

              {activeTab === "members" && <Members roomId={roomData.roomKey} />}

              {activeTab === "awards" && <Awards roomId={roomData.roomKey} />}

              {activeTab === "rollcall" && (
                <RollCall
                  roomId={roomData.roomKey}
                  gradYear={roomData.gradYear}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default RoomPage;
