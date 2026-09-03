import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../firebase";
import {
  PenTool,
  Sparkles,
  Trash2,
  X,
  Send,
  Heart,
  Star,
  GraduationCap,
  Smile,
  Award,
} from "lucide-react";
import "./autographs.css";

const PAPER_THEMES = [
  { id: "parchment", name: "Vintage Parchment", bg: "#fbf7ee", text: "#1e293b" },
  { id: "champagne", name: "Champagne Gold", bg: "#fcf6e8", text: "#422006" },
  { id: "rosegold", name: "Blush Rose", bg: "#fdf0ec", text: "#881337" },
  { id: "slate-paper", name: "Midnight Slate", bg: "#18202c", text: "#f8fafc" },
];

const STICKERS = ["🎓", "✨", "❤️", "🌟", "🥂", "🚀", "👑", "🔥"];

export default function Autographs({ roomId }) {
  const [members, setMembers] = useState([]);
  const [selectedPeerId, setSelectedPeerId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Composer Form
  const [message, setMessage] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("champagne");
  const [selectedSticker, setSelectedSticker] = useState("🎓");
  const [submitting, setSubmitting] = useState(false);

  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  // 1. Fetch cohort members
  useEffect(() => {
    async function fetchMembers() {
      try {
        const memberCol = collection(db, "rooms", roomId, "members");
        const memberSnap = await getDocs(memberCol);

        const loadedMembers = await Promise.all(
          memberSnap.docs.map(async (memDoc) => {
            const memberUid = memDoc.id;
            const userSnap = await getDoc(doc(db, "users", memberUid));
            const data = userSnap.data() || {};
            return {
              uid: memberUid,
              displayName: data.displayName || "Classmate",
            };
          })
        );

        setMembers(loadedMembers);
        if (loadedMembers.length > 0 && !selectedPeerId) {
          // Default to current user's wall if member, or first member
          const myMember = loadedMembers.find((m) => m.uid === uid);
          setSelectedPeerId(myMember ? myMember.uid : loadedMembers[0].uid);
        }
      } catch (err) {
        console.error("Error loading cohort members for autographs:", err);
      } finally {
        setLoading(false);
      }
    }

    if (roomId) fetchMembers();
  }, [roomId, uid]);

  // 2. Real-time listener for the selected classmate's autograph notes
  useEffect(() => {
    if (!roomId || !selectedPeerId) return;

    const notesCol = collection(
      db,
      "rooms",
      roomId,
      "autographs",
      selectedPeerId,
      "notes"
    );
    const q = query(notesCol, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedNotes = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setNotes(loadedNotes);
    });

    return () => unsubscribe();
  }, [roomId, selectedPeerId]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedPeerId || submitting) return;

    setSubmitting(true);
    try {
      // Deterministic slight tilt angle (-3deg to +3deg)
      const rotation = ((Math.random() * 6) - 3).toFixed(1);

      await addDoc(
        collection(
          db,
          "rooms",
          roomId,
          "autographs",
          selectedPeerId,
          "notes"
        ),
        {
          message: message.trim(),
          theme: selectedTheme,
          sticker: selectedSticker,
          rotation,
          authorId: uid,
          authorName: currentUser?.displayName || "Classmate",
          createdAt: serverTimestamp(),
        }
      );

      setMessage("");
      setIsComposerOpen(false);
    } catch (err) {
      alert("Failed to sign yearbook: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Remove this dedication note?")) return;
    try {
      await deleteDoc(
        doc(db, "rooms", roomId, "autographs", selectedPeerId, "notes", noteId)
      );
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const selectedPeer = members.find((m) => m.uid === selectedPeerId);
  const isMyWall = selectedPeerId === uid;

  return (
    <div className="autographs-container animate-fade-in">
      <div className="autographs-header">
        <div className="autographs-titles">
          <h2>Sign My Yearbook ✍️</h2>
          <p>
            {isMyWall
              ? "Your personal autograph wall. Dedications signed by your classmates."
              : `Signing ${selectedPeer?.displayName || "Classmate"}'s personal yearbook wall.`}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsComposerOpen(true)}
        >
          <PenTool size={16} />
          <span>{isMyWall ? "Sign Your Own Wall" : `Sign ${selectedPeer?.displayName?.split(" ")[0]}'s Book`}</span>
        </button>
      </div>

      {/* Classmate Wall Selector Strip */}
      <div className="wall-selector-strip">
        {members.map((member) => {
          const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
            member.displayName || member.uid
          )}&backgroundColor=141924`;
          const isActive = member.uid === selectedPeerId;

          return (
            <button
              key={member.uid}
              className={`wall-peer-chip ${isActive ? "active" : ""}`}
              onClick={() => setSelectedPeerId(member.uid)}
            >
              <img src={avatarUrl} alt={member.displayName} className="wall-peer-avatar" />
              <span>{member.displayName} {member.uid === uid ? "(You)" : ""}</span>
            </button>
          );
        })}
      </div>

      {/* Autograph Notes Sticky Board */}
      {notes.length === 0 ? (
        <div className="empty-cohort-state" style={{ margin: "24px 0" }}>
          <Sparkles className="empty-cohort-icon" color="var(--gold-primary)" />
          <h4>No yearbook dedications yet on this wall</h4>
          <p>Be the first classmate to sign with a personal note, polaroid sticker, and memory!</p>
          <button className="btn btn-primary btn-sm" onClick={() => setIsComposerOpen(true)}>
            <PenTool size={14} />
            <span>Leave First Autograph</span>
          </button>
        </div>
      ) : (
        <motion.div className="autographs-board" layout>
          <AnimatePresence>
            {notes.map((note) => {
              const authorAvatar = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
                note.authorName || note.authorId
              )}&backgroundColor=141924`;
              const canDelete = note.authorId === uid || isMyWall;

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.8, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className={`autograph-polaroid ${note.theme || "champagne"}`}
                  style={{ transform: `rotate(${note.rotation || 0}deg)` }}
                >
                  <div className="autograph-tape" />
                  {note.sticker && (
                    <span className="autograph-sticker-badge">{note.sticker}</span>
                  )}

                  <div className="autograph-message-body">{note.message}</div>

                  <div className="autograph-author-footer">
                    <div className="autograph-signer">
                      <img src={authorAvatar} alt={note.authorName} className="autograph-signer-avatar" />
                      <span className="autograph-signer-name">– {note.authorName}</span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="btn-ghost btn-sm"
                        style={{ padding: "4px", color: "inherit", opacity: 0.6 }}
                        title="Delete Dedication"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Autograph Composer Modal */}
      {isComposerOpen && (
        <div className="autograph-composer-overlay animate-fade-in" onClick={() => setIsComposerOpen(false)}>
          <div className="autograph-composer-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: "1.2rem", color: "#fff", margin: 0 }}>
                Sign {selectedPeer?.displayName}'s Yearbook
              </h3>
              <button className="btn-ghost btn-sm" onClick={() => setIsComposerOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNote}>
              {/* Paper Tint Picker */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Paper Tone
                </label>
                <div className="color-picker-strip">
                  {PAPER_THEMES.map((theme) => (
                    <button
                      type="button"
                      key={theme.id}
                      className={`color-option-btn ${selectedTheme === theme.id ? "active" : ""}`}
                      style={{ background: theme.bg }}
                      onClick={() => setSelectedTheme(theme.id)}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>

              {/* Sticker Picker */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Yearbook Stamp / Sticker
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {STICKERS.map((stk) => (
                    <button
                      type="button"
                      key={stk}
                      onClick={() => setSelectedSticker(stk)}
                      style={{
                        fontSize: "1.2rem",
                        padding: "4px 8px",
                        background: selectedSticker === stk ? "rgba(229, 184, 105, 0.2)" : "rgba(255, 255, 255, 0.04)",
                        border: selectedSticker === stk ? "1px solid var(--gold-primary)" : "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Handwritten Note Area */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Your Dedication (Handwritten Script)
                </label>
                <textarea
                  className="input-base"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "1.4rem",
                    minHeight: "120px",
                    lineHeight: "1.3",
                    background: PAPER_THEMES.find((t) => t.id === selectedTheme)?.bg,
                    color: PAPER_THEMES.find((t) => t.id === selectedTheme)?.text,
                  }}
                  placeholder="Dear friend, congratulations on graduating! Never forget the all-nighters..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsComposerOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting || !message.trim()}
                >
                  <Send size={14} />
                  <span>{submitting ? "Pinning Note..." : "Pin Autograph"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
