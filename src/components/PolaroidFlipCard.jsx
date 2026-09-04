import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  RotateCcw,
  Sparkles,
  Trash2,
  Calendar,
  Heart,
  Edit3,
  Check,
} from "lucide-react";
import "./polaroid-card.css";

const REACTIONS = [
  { label: "❤️", name: "Love" },
  { label: "👍", name: "Like" },
  { label: "😂", name: "Laugh" },
  { label: "✨", name: "Sparkle" },
];

export default function PolaroidFlipCard({
  post,
  roomId,
  onDelete,
  onEdit,
  idx = 0,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  // Subscribe to Firebase Auth state to handle async session restoration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const clean = (s) => (s || "").toLowerCase().replace(/[\s\-_.]/g, "");

  const uid = currentUser?.uid;
  const cleanUid = clean(uid);
  const cleanEmail = clean(currentUser?.email);
  const cleanName = clean(currentUser?.displayName);

  const postAuthorId = post.authorId;
  const postAuthorEmail = clean(post.authorEmail);
  const postAuthorName = clean(post.authorName);

  // Exact clean matching for author identification
  const isAuthor = Boolean(
    currentUser && (
      (cleanUid && postAuthorId && cleanUid === postAuthorId) ||
      (cleanEmail && postAuthorEmail && cleanEmail === postAuthorEmail) ||
      (cleanName && postAuthorName && cleanName === postAuthorName)
    )
  );

  // Varied rotation angle for natural physical look (-2deg to +2deg)
  const rotation = post.rotation || ((idx % 3 === 0 ? -1.5 : idx % 2 === 0 ? 1.8 : -1.2)).toFixed(1);
  const anchorType = post.anchor || (idx % 2 === 0 ? "gold" : "scotch");

  const imageSrc =
    post.imageUrls?.[0] ||
    "/grads/grad1.png";

  // Derive retro 35mm orange date code
  const dateObj = post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt || Date.now());
  const yearCode = `'${dateObj.getFullYear().toString().slice(-2)}`;
  const monthCode = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const dayCode = dateObj.getDate().toString().padStart(2, "0");
  const retroDateStr = `${yearCode} · ${monthCode} · ${dayCode}`;

  const reactions = post.reactions || {};
  const userReaction = uid ? reactions[uid] : null;

  // Compute live reaction counts
  const counts = { "❤️": 0, "👍": 0, "😂": 0, "✨": 0 };
  Object.values(reactions).forEach((emoji) => {
    if (counts[emoji] !== undefined) {
      counts[emoji]++;
    }
  });

  // Handle Like / Reaction Click (Strictly disabled for author)
  const handleReact = async (emoji, e) => {
    e.stopPropagation();
    if (!uid || !roomId || !post.id || isAuthor) return;

    try {
      const postRef = doc(db, "rooms", roomId, "posts", post.id);
      if (userReaction === emoji) {
        // Toggle off if clicking the same reaction again
        const updated = { ...reactions };
        delete updated[uid];
        await updateDoc(postRef, { reactions: updated });
      } else {
        // Assign new reaction
        await updateDoc(postRef, {
          [`reactions.${uid}`]: emoji,
        });
      }
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  const authorAvatar = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
    post.authorName || post.authorId || "Classmate"
  )}&backgroundColor=fef3c7`;

  return (
    <div className="polaroid-flip-stage animate-fade-in" style={{ transform: `rotate(${rotation}deg)` }}>
      <motion.div
        className="polaroid-card-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* ================= FRONT FACE: GLOSSY POLAROID ================= */}
        <div className="polaroid-face-front">
          {/* Washi Tape Strip */}
          <div className={`polaroid-anchor-tape ${anchorType}`} />

          {/* Photo Frame */}
          <div className="polaroid-photo-frame">
            <img src={imageSrc} alt="Memory Frame" loading="lazy" />
            <span className="retro-35mm-date">{retroDateStr}</span>
          </div>

          {/* White Polaroid Chin with Handwritten Script & Reactions */}
          <div className="polaroid-chin">
            <div className="polaroid-handwritten-caption">
              {post.message || "Unwritten Senior Memory"}
            </div>

            {/* Reaction / Like Pills with Counters */}
            <div className="polaroid-reactions-row" onClick={(e) => e.stopPropagation()}>
              {REACTIONS.map((r) => {
                const count = counts[r.label] || 0;
                const isSelected = userReaction === r.label;

                return (
                  <button
                    key={r.label}
                    className={`polaroid-reaction-pill ${isSelected ? "active" : ""}`}
                    disabled={isAuthor}
                    onClick={(e) => handleReact(r.label, e)}
                    title={
                      isAuthor
                        ? "You cannot like your own post"
                        : isSelected
                        ? `Remove your ${r.name}`
                        : `React with ${r.name}`
                    }
                  >
                    <span>{r.label}</span>
                    {count > 0 && <span className="reaction-counter-num">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Chin Footer: Author Attribution & Action Buttons */}
            <div className="polaroid-flip-hint">
              <span style={{ fontWeight: 600 }}>
                – {post.authorName || "Classmate"} {isAuthor && <span style={{ color: "var(--gold-dark)", fontSize: "0.6875rem" }}>(You)</span>}
              </span>
              
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Author Edit & Delete Actions directly on front */}
                {isAuthor && (
                  <div className="author-actions-strip" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="author-action-pill"
                      onClick={() => onEdit && onEdit(post)}
                      title="Edit this memory"
                    >
                      <Edit3 size={11} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="author-action-pill delete"
                      onClick={() => onDelete && onDelete(post.id)}
                      title="Delete this memory"
                    >
                      <Trash2 size={11} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}

                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <RotateCcw size={11} />
                  <span>Flip</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BACK FACE: VINTAGE POSTCARD & RUBBER STAMP ================= */}
        <div className="polaroid-face-back" onClick={(e) => e.stopPropagation()}>
          {/* Postage Header */}
          <div className="postcard-postage-mark">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src={authorAvatar}
                alt={post.authorName}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #d4af37" }}
              />
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>
                  {post.authorName || "Classmate"} {isAuthor && <span style={{ color: "var(--gold-dark)", fontSize: "0.6875rem" }}>(You)</span>}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                  {dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>

            <button
              className="btn-ghost btn-sm"
              onClick={() => setIsFlipped(false)}
              style={{ padding: "4px", color: "#64748b" }}
              title="Flip to front"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Diary Story */}
          <div className="postcard-diary-entry">
            "{post.message}"
          </div>

          {/* Official Rubber Ink Stamp Impression */}
          <div style={{ margin: "8px 0", textAlign: "center" }}>
            <span className={`rubber-ink-stamp ${post.stampColor || "crimson"}`}>
              {post.stamp || "CORE MEMORY"}
            </span>
          </div>

          {/* Reaction Summary & Author Actions on Back */}
          <div style={{ borderTop: "1px dashed rgba(0, 0, 0, 0.15)", paddingTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Classmate Reactions:
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {REACTIONS.map((r) => {
                  const c = counts[r.label] || 0;
                  if (c === 0) return null;
                  return (
                    <span key={r.label} style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                      {r.label} {c}
                    </span>
                  );
                })}
              </div>
            </div>

            {isAuthor && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onEdit && onEdit(post)}
                  style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                >
                  <Edit3 size={13} />
                  <span>Edit Entry</span>
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete && onDelete(post.id)}
                  style={{ padding: "4px 10px", fontSize: "0.75rem", background: "#ef4444", color: "#fff" }}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
