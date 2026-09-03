import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import PolaroidFlipCard from "../components/PolaroidFlipCard";
import { DEFAULT_GRADUATION_MEMORIES } from "../data/defaultMemories";
import { Sparkles, Camera, Filter } from "lucide-react";
import "./postlist.css";

const MOOD_FILTERS = [
  "All Frames",
  "CORE MEMORY",
  "MIDNIGHT LAB",
  "SENIOR CAPSTONE",
  "CAMPUS QUAD",
  "FORMAL GALA",
];

export default function PostList({
  roomId,
  onDelete,
  onEditPost,
}) {
  const [posts, setPosts] = useState([]);
  const [selectedMood, setSelectedMood] = useState("All Frames");
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!roomId) return;
    const q = query(collection(db, "rooms", roomId, "posts"));
    return onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sorted = arr.sort((a, b) => (b.createdAt?.toMillis?.() || b.updatedAt || 0) - (a.createdAt?.toMillis?.() || a.updatedAt || 0));

      // Strict Deduplication by post ID and image URL
      const seenIds = new Set();
      const seenImages = new Set();
      const uniquePosts = [];

      for (const p of sorted) {
        const imgKey = p.imageUrls?.[0];
        if (seenIds.has(p.id)) continue;
        if (imgKey && seenImages.has(imgKey)) continue;

        seenIds.add(p.id);
        if (imgKey) seenImages.add(imgKey);
        uniquePosts.push(p);
      }

      if (uniquePosts.length === 0) {
        setPosts(DEFAULT_GRADUATION_MEMORIES);
      } else {
        setPosts(uniquePosts);
      }
    });
  }, [roomId]);

  const handleDelete = async (postId) => {
    if (postId?.startsWith?.("mem-")) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      return;
    }
    if (!window.confirm("Remove this memory from the yearbook?")) return;
    try {
      await deleteDoc(doc(db, "rooms", roomId, "posts", postId));
      onDelete?.();
    } catch (err) {
      alert("Error deleting memory: " + err.message);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedMood === "All Frames") return true;
    return (p.stamp || "CORE MEMORY") === selectedMood;
  });

  return (
    <div className="postlist-container">
      {/* Mood / Chapter Filter Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {MOOD_FILTERS.map((mood) => (
            <button
              key={mood}
              className={`dept-chip ${selectedMood === mood ? "active" : ""}`}
              onClick={() => setSelectedMood(mood)}
              style={{ fontFamily: mood !== "All Frames" ? "'Courier New', monospace" : "inherit" }}
            >
              {mood}
            </button>
          ))}
        </div>

        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <Camera size={14} color="var(--gold-primary)" />
          <span>{filteredPosts.length} Polaroids Preserved</span>
        </div>
      </div>

      {/* Asymmetrical 3D Polaroid Memory Wall */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "36px 24px",
          padding: "16px 0 40px",
        }}
      >
        {filteredPosts.map((p, idx) => (
          <PolaroidFlipCard
            key={p.id}
            post={p}
            roomId={roomId}
            idx={idx}
            onDelete={handleDelete}
            onEdit={onEditPost}
          />
        ))}
      </div>
    </div>
  );
}
