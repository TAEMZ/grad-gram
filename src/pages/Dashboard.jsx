import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import ProfileSection from "../components/ProfileSection";
import FloatingCapCeremony from "../components/FloatingCapCeremony";
import BookshelfGallery from "../components/BookshelfGallery";
import { getCohortLogo } from "../utils/cohortLogos";
import { GradGramMark } from "../components/GradGramLogo";
import {
  createRoomInDatabase,
  joinRoom,
  checkUserCreatedRooms,
  listJoinedRooms,
  deleteRoomInDatabase,
} from "../models/authModel";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  GraduationCap,
  Plus,
  LogIn,
  KeyRound,
  Users,
  Search,
  LogOut,
  Menu,
  X,
  Copy,
  Check,
  Building2,
  Sparkles,
  Trash2,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  Settings,
  Library,
} from "lucide-react";
import "./dashboard.css";

const DEPARTMENTS = [
  "All",
  "Computer Science",
  "Engineering",
  "Medicine",
  "Business & Finance",
  "Law",
  "Fine Arts",
];

// Helper to convert year to Roman numeral (e.g. 2026 -> MMXXVI)
function toRomanYear(yearStr) {
  const num = parseInt(yearStr, 10);
  if (isNaN(num)) return "MMXXVI";
  const romanMap = [
    { val: 1000, sym: "M" },
    { val: 900, sym: "CM" },
    { val: 500, sym: "D" },
    { val: 400, sym: "CD" },
    { val: 100, sym: "C" },
    { val: 90, sym: "XC" },
    { val: 50, sym: "L" },
    { val: 40, sym: "XL" },
    { val: 10, sym: "X" },
    { val: 9, sym: "IX" },
    { val: 5, sym: "V" },
    { val: 4, sym: "IV" },
    { val: 1, sym: "I" },
  ];
  let n = num;
  let res = "";
  for (const { val, sym } of romanMap) {
    while (n >= val) {
      res += sym;
      n -= val;
    }
  }
  return res || "MMXXVI";
}

function Dashboard() {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'join' | 'create'
  const [viewStyle, setViewStyle] = useState("shelf"); // 'shelf' | 'folios'
  const [createdRooms, setCreatedRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [allCohorts, setAllCohorts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [copiedKey, setCopiedKey] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const [form, setForm] = useState({
    university: "",
    department: "",
    roomKey: "",
    gradYear: "2026",
    commencementDate: "2026-05-30",
    shelfStyle: "leaning-right",
    logo: "",
  });

  // Fetch Rooms & Profile
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      try {
        // 1. Fetch ALL Cohort Rooms in database for the bookshelf
        const roomsSnap = await getDocs(collection(db, "rooms"));
        const allSystemRooms = roomsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllCohorts(allSystemRooms);

        if (uid) {
          // 2. User profile
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }

          // 3. Created Rooms
          const created = await checkUserCreatedRooms(uid);
          setCreatedRooms(created || []);

          // 4. Joined Rooms
          const joined = await listJoinedRooms(uid);
          setJoinedRooms(joined || []);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [uid]);

  const handleCopyKey = (key, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!form.university || !form.department) {
      alert("Please specify the university and academic department.");
      return;
    }

    try {
      const generatedKey = Math.random().toString(36).substring(2, 10).toUpperCase();
      await createRoomInDatabase(
        uid,
        {
          university: form.university,
          department: form.department,
          logo: form.logo,
          commencementDate: form.commencementDate,
          gradYear: form.gradYear,
          shelfStyle: form.shelfStyle,
        }
      );

      setForm({
        university: "",
        department: "",
        roomKey: "",
        gradYear: "2026",
        commencementDate: "2026-05-30",
        shelfStyle: "leaning-right",
        logo: "",
      });

      const updated = await checkUserCreatedRooms(uid);
      setCreatedRooms(updated || []);
      setActiveTab("all");
    } catch (err) {
      alert("Error establishing cohort: " + err.message);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!form.roomKey) {
      alert("Please enter the cohort passkey.");
      return;
    }

    try {
      const res = await joinRoom(form.roomKey.trim(), uid);
      if (res.success) {
        setForm((prev) => ({ ...prev, roomKey: "" }));
        const updatedJoined = await listJoinedRooms(uid);
        setJoinedRooms(updatedJoined || []);
        setActiveTab("all");
      } else {
        alert(res.message || "Invalid passkey.");
      }
    } catch (err) {
      alert("Error joining cohort: " + err.message);
    }
  };

  const handleDeleteRoom = async (roomKey, e) => {
    e.stopPropagation();
    if (window.confirm("Archive and delete this graduation cohort?")) {
      try {
        await deleteRoomInDatabase(roomKey);
        setCreatedRooms((prev) => prev.filter((r) => r.id !== roomKey));
      } catch (err) {
        alert("Deletion failed: " + err.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Combine unique rooms (Starts with all database cohorts so bookshelf is always populated!)
  const allRoomsMap = new Map();
  allCohorts.forEach((r) => allRoomsMap.set(r.id, { ...r, isCreator: r.createdBy === uid }));
  createdRooms.forEach((r) => allRoomsMap.set(r.id, { ...allRoomsMap.get(r.id), ...r, isCreator: true }));
  joinedRooms.forEach((r) => {
    const existing = allRoomsMap.get(r.id) || {};
    allRoomsMap.set(r.id, { ...existing, ...r, isMember: true });
  });
  const allRooms = Array.from(allRoomsMap.values());

  const filteredRooms = allRooms
    .filter((r) => {
      const matchesSearch =
        r.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        selectedDept === "All" ||
        r.department?.toLowerCase().includes(selectedDept.toLowerCase());

      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      const aHawassa = (a.university || "").toLowerCase().includes("hawassa");
      const bHawassa = (b.university || "").toLowerCase().includes("hawassa");
      if (aHawassa && !bHawassa) return -1;
      if (!aHawassa && bHawassa) return 1;
      return 0;
    });

  const currentUserAvatar = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
    userProfile?.displayName || auth.currentUser?.displayName || "Scholar"
  )}&backgroundColor=141924`;

  return (
    <div className="dashboard-layout">
      {/* Profile Settings Modal */}
      <ProfileSection
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdate={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
      />

      {/* Mobile Topbar */}
      <header className="dashboard-topbar">
        <div className="topbar-brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GradGramMark size={28} />
          <span>GradGram</span>
        </div>
        <button
          className="topbar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Navigation"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Dashboard Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-logo" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <GradGramMark size={38} />
            <div className="brand-text">
              <h2 style={{ fontFamily: "'Cinzel', serif", fontWeight: 800 }}>GradGram</h2>
              <span className="brand-badge">Academic Suite</span>
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
          <div>
            <div className="sidebar-section-title">Cohort Navigation</div>
            <ul className="nav-links">
              <li>
                <button
                  className={`nav-item-btn ${activeTab === "all" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("all");
                    setSidebarOpen(false);
                  }}
                >
                  <div className="nav-item-content">
                    <BookOpen size={16} />
                    <span>My Cohorts</span>
                  </div>
                  <span className="nav-item-badge">{allRooms.length}</span>
                </button>
              </li>
              <li>
                <button
                  className={`nav-item-btn ${activeTab === "join" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("join");
                    setSidebarOpen(false);
                  }}
                >
                  <div className="nav-item-content">
                    <LogIn size={16} />
                    <span>Join with Key</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  className={`nav-item-btn ${activeTab === "create" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("create");
                    setSidebarOpen(false);
                  }}
                >
                  <div className="nav-item-content">
                    <Plus size={16} />
                    <span>Establish Cohort</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="sidebar-user">
          <div className="user-profile-row">
            <button
              className="user-profile-btn"
              onClick={() => setIsProfileOpen(true)}
              title="Edit Scholar Profile"
            >
              <img src={currentUserAvatar} alt="Avatar" className="user-avatar" />
              <div className="user-info">
                <span className="user-name">
                  {userProfile?.displayName || auth.currentUser?.displayName || "Scholar"}
                </span>
                <span className="user-email">
                  {auth.currentUser?.email?.slice(0, 18)}...
                </span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="btn-ghost btn-sm"
              style={{ padding: "6px", color: "var(--text-muted)" }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Workspace */}
      <main className="dashboard-main">
        {/* Hero Greeting */}
        <div className="dashboard-hero-header">
          <h1>Graduate Archives & Cohorts</h1>
          <p>
            Welcome back, {userProfile?.displayName || "Scholar"}. Explore your enrolled institutional yearbooks and graduation ceremonies.
          </p>
        </div>

        {/* The Unboxed 3D Floating Cap Ceremony (Zero Boxes / Standalone Parallax Object) */}
        <FloatingCapCeremony />

        {/* Archival Tab Segmented Switcher */}
        <div className="archival-tab-switch">
          <button
            className={`archival-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <BookOpen size={14} />
            <span>Enrolled Cohorts ({allRooms.length})</span>
          </button>
          <button
            className={`archival-tab-btn ${activeTab === "join" ? "active" : ""}`}
            onClick={() => setActiveTab("join")}
          >
            <LogIn size={14} />
            <span>Enter Passkey</span>
          </button>
          <button
            className={`archival-tab-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            <Plus size={14} />
            <span>Establish Cohort</span>
          </button>
        </div>

        {/* TAB 1: ALL COHORTS */}
        {activeTab === "all" && (
          <div>
            {/* Search & Department Ledger Filters + Shelf View Toggle */}
            <div className="archival-search-bar">
              <div className="search-input-wrapper">
                <Search size={15} color="var(--slate-400)" />
                <input
                  type="text"
                  placeholder="Search archive by university, department, or key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="department-chips-row">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      className={`dept-chip ${selectedDept === dept ? "active" : ""}`}
                      onClick={() => setSelectedDept(dept)}
                    >
                      {dept}
                    </button>
                  ))}
                </div>

                {/* View Switcher: 3D Bookshelf vs Clean Folios */}
                <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.4)", padding: 3, borderRadius: 8 }}>
                  <button
                    className={`btn-ghost btn-sm ${viewStyle === "shelf" ? "active" : ""}`}
                    onClick={() => setViewStyle("shelf")}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: viewStyle === "shelf" ? "var(--gold-subtle)" : "transparent",
                      color: viewStyle === "shelf" ? "var(--gold-light)" : "var(--text-muted)",
                    }}
                    title="3D Bookshelf View"
                  >
                    <Library size={14} />
                  </button>
                  <button
                    className={`btn-ghost btn-sm ${viewStyle === "folios" ? "active" : ""}`}
                    onClick={() => setViewStyle("folios")}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: viewStyle === "folios" ? "var(--gold-subtle)" : "transparent",
                      color: viewStyle === "folios" ? "var(--gold-light)" : "var(--text-muted)",
                    }}
                    title="Folio Grid View"
                  >
                    <Layers size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredRooms.length === 0 ? (
              <div className="empty-cohort-state">
                <GraduationCap className="empty-cohort-icon" />
                <h4>No Cohort Volumes Found</h4>
                <p>
                  You have not joined any cohort archives yet. Join with an invite passkey or establish a new graduating class volume.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("join")}>
                    <LogIn size={14} />
                    <span>Enter Passkey</span>
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveTab("create")}>
                    <Plus size={14} />
                    <span>Establish Cohort</span>
                  </button>
                </div>
              </div>
            ) : viewStyle === "shelf" ? (
              /* PRIMARY VIEW: STRIPE PRESS-INSPIRED 3D BOOKSHELF */
              <BookshelfGallery rooms={filteredRooms} />
            ) : (
              /* SECONDARY VIEW: CLEAN ARCHIVAL FOLIOS (ZERO STRIPES) */
              <div className="archival-folios-grid">
                {filteredRooms.map((room) => {
                  const initial = room.university?.[0]?.toUpperCase() || "U";
                  const romanEdition = toRomanYear(room.gradYear || "2026");

                  return (
                    <div
                      key={room.id}
                      className="archival-cohort-folio"
                      onClick={() => navigate(`/room/${room.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <div className="folio-top-meta">
                          <div className="folio-crest-badge">
                            {getCohortLogo(room) ? (
                              <img
                                src={getCohortLogo(room)}
                                alt={room.university}
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
                              />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>
                          <span className="folio-volume-tag">
                            Vol. {romanEdition}
                          </span>
                        </div>

                        <div className="folio-titles">
                          <h3>{room.university}</h3>
                          <div className="folio-dept-title">
                            {room.department} · Class of {room.gradYear || "2026"}
                          </div>
                        </div>
                      </div>

                      <div className="folio-footer-actions">
                        <button
                          className="folio-passkey-chip"
                          onClick={(e) => handleCopyKey(room.id, e)}
                          title="Click to copy passkey"
                        >
                          <span>{room.id.slice(0, 10)}...</span>
                          {copiedKey === room.id ? (
                            <Check size={12} color="#4ade80" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {room.isCreator && (
                            <button
                              className="btn-ghost btn-sm"
                              onClick={(e) => handleDeleteRoom(room.id, e)}
                              style={{ padding: "6px", color: "var(--status-danger)" }}
                              title="Archive Cohort"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}

                          <button
                            className="folio-open-seal-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/room/${room.id}`);
                            }}
                          >
                            <span>Open Yearbook</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: JOIN WITH PASSKEY */}
        {activeTab === "join" && (
          <div style={{ maxWidth: 480, margin: "20px auto" }}>
            <div className="card-glass" style={{ padding: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "var(--gold-subtle)",
                    border: "1px solid rgba(229, 184, 105, 0.4)",
                    color: "var(--gold-light)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <KeyRound size={24} />
                </div>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.35rem", color: "#fff" }}>
                  Join an Existing Cohort
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: 4 }}>
                  Enter the unique cohort passkey provided by your class president or commencement committee.
                </p>
              </div>

              <form onSubmit={handleJoinRoom} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                    Cohort Passkey
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="e.g. HARVARD-CS-2026"
                    value={form.roomKey}
                    onChange={(e) => setForm((prev) => ({ ...prev, roomKey: e.target.value }))}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }}>
                  <LogIn size={16} />
                  <span>Enter Cohort Archive</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ESTABLISH NEW COHORT */}
        {activeTab === "create" && (
          <div style={{ maxWidth: 540, margin: "20px auto" }}>
            <div className="card-glass" style={{ padding: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "var(--gold-subtle)",
                    border: "1px solid rgba(229, 184, 105, 0.4)",
                    color: "var(--gold-light)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Plus size={24} />
                </div>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.35rem", color: "#fff" }}>
                  Establish a New Cohort Volume
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: 4 }}>
                  Create an immortal graduation space for your university class and department.
                </p>
              </div>

              <form onSubmit={handleCreateRoom} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                    University / College Name
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="e.g. Stanford University"
                    value={form.university}
                    onChange={(e) => setForm((prev) => ({ ...prev, university: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                    Academic Department
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="e.g. Computer Science & AI"
                    value={form.department}
                    onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      className="input-base"
                      value={form.gradYear}
                      onChange={(e) => setForm((prev) => ({ ...prev, gradYear: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                      Commencement Date
                    </label>
                    <input
                      type="date"
                      className="input-base"
                      value={form.commencementDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, commencementDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                    Book Shelf Alignment
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className={`washi-choice-chip ${form.shelfStyle === "leaning-right" ? "active" : ""}`}
                      onClick={() => setForm((prev) => ({ ...prev, shelfStyle: "leaning-right" }))}
                    >
                      📚 Leaning Supported
                    </button>
                    <button
                      type="button"
                      className={`washi-choice-chip ${form.shelfStyle === "upright" ? "active" : ""}`}
                      onClick={() => setForm((prev) => ({ ...prev, shelfStyle: "upright" }))}
                    >
                      📖 Classic Upright
                    </button>
                    <button
                      type="button"
                      className={`washi-choice-chip ${form.shelfStyle === "accent" ? "active" : ""}`}
                      onClick={() => setForm((prev) => ({ ...prev, shelfStyle: "accent" }))}
                    >
                      📐 Accent Tilt
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }}>
                  <Sparkles size={16} />
                  <span>Publish Cohort Space</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
