import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import PostCard from "./PostCard";
import {
  createRoomInDatabase,
  joinRoom,
  checkUserCreatedRooms,
  listJoinedRooms,
  leaveRoom,
  deleteRoomInDatabase,
} from "../models/authModel";

import "./dashboard.css";
import { db } from "../firebase";
// Make sure this path is correct
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
function Dashboard() {
  const navigate = useNavigate();
  const uid = auth.currentUser.uid;

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [createdRooms, setCreatedRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Add this function to Dashboard component
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      // Step 1: Find public users by name
      const usersSnapshot = await getDocs(
        query(
          collection(db, "users"),
          where("displayName", ">=", searchQuery),
          where("displayName", "<=", searchQuery + "\uf8ff"),
          where("isPublic", "==", true)
        )
      );

      const usersData = usersSnapshot.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      }));
      console.log("Matched public users:", usersData);

      if (!usersData.length) {
        console.log("No matching users found.");
        return;
      }

      // Step 2: Search all rooms
      const roomsSnapshot = await getDocs(collection(db, "rooms"));
      let results = [];

      for (const roomDoc of roomsSnapshot.docs) {
        const authorIds = usersData.map((u) => u.uid);

        const postsSnapshot = await getDocs(
          query(
            collection(db, "rooms", roomDoc.id, "posts"),
            where("authorId", "in", authorIds)
          )
        );

        postsSnapshot.forEach((postDoc) => {
          const postData = postDoc.data();
          const user = usersData.find((u) => u.uid === postData.authorId);
          if (user) {
            results.push({
              id: postDoc.id,
              ...postData,
              roomId: roomDoc.id,
              user,
            });
          }
        });
      }

      // Step 3: Sort and limit
      const sortedResults = results
        .sort((a, b) => b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.())
        .slice(0, 10);

      console.log("Search results:", sortedResults);
      setSearchResults(sortedResults);
    } catch (err) {
      console.error("Search error:", err);
      alert("Search failed: " + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const [form, setForm] = useState({
    university: "",
    department: "",
    roomKey: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const created = await checkUserCreatedRooms(uid);
      const joined = await listJoinedRooms(uid);
      setCreatedRooms(created);
      setJoinedRooms(joined);
      setIsLoading(false);
    })();
  }, [uid]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const toggleRoomCreation = () => setIsCreatingRoom((prev) => !prev);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.trimStart() }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  const handleReact = async (roomId, postId, emoji) => {
    try {
      const postRef = doc(db, "rooms", roomId, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) throw new Error("Post does not exist");

      const postData = postSnap.data();
      const reactions = { ...(postData.reactions || {}) };

      if (reactions[uid] === emoji) {
        delete reactions[uid];
      } else {
        reactions[uid] = emoji;
      }

      await updateDoc(postRef, { reactions });

      // 🔥 Re-fetch updated post and update search results
      await updateSearchPost(roomId, postId);
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!form.university || !form.department) {
      return alert("Please fill all fields.");
    }

    try {
      let logoUrl = null;
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("upload_preset", "cloudinary");

        const uploadResponse = await fetch(
          "https://api.cloudinary.com/v1_1/da7hlicdz/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.secure_url;
      }

      const roomKey = await createRoomInDatabase(uid, {
        university: form.university,
        department: form.department,
        logo: logoUrl,
      });

      const created = await checkUserCreatedRooms(uid);
      setCreatedRooms(created);
      navigate(`/room/${roomKey}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!form.roomKey) return alert("Please enter a valid room key.");
    try {
      await joinRoom(form.roomKey, uid);
      const joined = await listJoinedRooms(uid);
      setJoinedRooms(joined);
      navigate(`/room/${form.roomKey}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeaveRoom = async (roomKey) => {
    try {
      await leaveRoom(roomKey, uid);
      setJoinedRooms((prev) => prev.filter((r) => r.id !== roomKey));
    } catch (err) {
      alert("Error leaving room: " + err.message);
    }
  };

  const handleDeleteRoom = async (roomKey) => {
    if (!window.confirm("Delete this room? This cannot be undone.")) return;
    try {
      await deleteRoomInDatabase(roomKey);
      setCreatedRooms((prev) => prev.filter((r) => r.id !== roomKey));
    } catch (err) {
      alert("Error deleting room: " + err.message);
    }
  };

  if (isLoading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Preparing your dashboard...</p>
      </div>
    );
  const updateSearchPost = async (roomId, postId) => {
    const postDocRef = doc(db, "rooms", roomId, "posts", postId);
    const postSnap = await getDoc(postDocRef);
    if (!postSnap.exists()) return;

    setSearchResults((prev) =>
      prev.map((p) =>
        p.id === postId && p.roomId === roomId
          ? { ...p, ...postSnap.data() }
          : p
      )
    );
  };

  return (
    <div className="dashboard-container">
      {/* Burger button */}
      <button className="burger-btn" onClick={toggleSidebar}>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
      </button>

      {/* Sidebar */}
      <aside className={`rooms-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>My Rooms</h2>
          <p className="welcome-message">
            Welcome back, {auth.currentUser.displayName || "friend"}!
          </p>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3 className="section-title">
              <span className="icon">🏠</span> Created Rooms
            </h3>
            {createdRooms.length > 0 ? (
              <ul className="room-list">
                {createdRooms.map((room) => (
                  <li key={room.id} className="room-item">
                    <div className="room-info">
                      <span className="room-name">
                        {room.university} - {room.department}
                      </span>
                      <small className="room-id">{room.id}</small>
                    </div>
                    <div className="room-actions">
                      <button
                        onClick={() => navigate(`/room/${room.id}`)}
                        className="action-btn primary"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="action-btn danger"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-message">You haven't created any rooms yet</p>
            )}
          </div>

          <div className="divider"></div>

          <div className="sidebar-section">
            <h3 className="section-title">
              <span className="icon">👥</span> Joined Rooms
            </h3>
            {joinedRooms.length > 0 ? (
              <ul className="room-list">
                {joinedRooms.map((room) => (
                  <li key={room.id} className="room-item">
                    <div className="room-info">
                      <span className="room-name">
                        {room.university} - {room.department}
                      </span>
                      <small className="room-id">{room.id}</small>
                    </div>
                    <div className="room-actions">
                      <button
                        onClick={() => navigate(`/room/${room.id}`)}
                        className="action-btn primary"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleLeaveRoom(room.id)}
                        className="action-btn danger"
                      >
                        Leave
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-message">You haven't joined any rooms yet</p>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <section className="welcome-section">
          <h1>Welcome to GradGram</h1>
          <p className="welcome-text">
            Connect with your classmates, share memories, and create lasting
            digital yearbooks together.
          </p>
          <div className="decorative-line"></div>
        </section>
        <section className="search-section">
          <h3>Find Classmates</h3>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search classmates by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" disabled={isSearching}>
              {isSearching ? (
                <>
                  <span className="spinner"></span> Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </form>
          {searchResults.length === 0 && !isSearching && searchQuery && (
            <div className="empty-results">
              No posts found matching your search
            </div>
          )}
          {searchResults.map((post) => {
            const userEmoji = post.reactions?.[uid] || "";
            const counts = { "👍": 0, "❤️": 0, "😂": 0, "😢": 0 };
            Object.values(post.reactions || {}).forEach((e) => {
              if (counts[e] !== undefined) counts[e]++;
            });

            return (
              <PostCard
                key={post.id}
                post={post}
                userEmoji={userEmoji}
                emojiCounts={counts}
                canEdit={post.authorId === uid}
                onReact={(emoji) => handleReact(post.roomId, post.id, emoji)}
                onDelete={null}
                onEdit={() => {}}
              />
            );
          })}
        </section>
        <section className="action-section">
          <div className="action-card">
            <h3>
              {isCreatingRoom ? "Create a New Room" : "Join Existing Room"}
            </h3>
            <p className="action-description">
              {isCreatingRoom
                ? "Start a new space for your university department"
                : "Enter a room key to join your classmates"}
            </p>

            <button onClick={toggleRoomCreation} className="toggle-btn">
              {isCreatingRoom ? "↩ Switch to Join" : "➕ Switch to Create"}
            </button>

            {isCreatingRoom ? (
              <form onSubmit={handleCreateRoom} className="room-form">
                <div className="form-group">
                  <label htmlFor="university">University</label>
                  <input
                    id="university"
                    name="university"
                    placeholder="e.g. Hawassa University"
                    value={form.university}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    id="department"
                    name="department"
                    placeholder="e.g. Computer Science"
                    value={form.department}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="logo-upload">
                    University Logo (Optional)
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  {logoPreview && (
                    <div className="logo-preview">
                      <img src={logoPreview} alt="Logo preview" />
                    </div>
                  )}
                </div>

                <button type="submit" className="submit-btn">
                  Create Room
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinRoom} className="room-form">
                <div className="form-group">
                  <label htmlFor="roomKey">Room Key</label>
                  <input
                    id="roomKey"
                    name="roomKey"
                    placeholder="Enter room key"
                    value={form.roomKey}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">
                  Join Room
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="tips-section">
          <h3>Quick Tips</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">🔑</span>
              <h4>Share Room Keys</h4>
              <p>
                Send your room key to classmates so they can join your space
              </p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">📸</span>
              <h4>Add Photos</h4>
              <p>Upload memories and create a digital yearbook together</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">💬</span>
              <h4>Leave Messages</h4>
              <p>Share your thoughts and farewell messages with peers</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
