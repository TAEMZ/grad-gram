import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Send,
  Image as ImageIcon,
  Check,
  Loader2,
  Edit3,
} from "lucide-react";
import "./darkroom-composer.css";

const TAPE_STYLES = [
  { id: "gold", label: "Gold Washi Tape" },
  { id: "scotch", label: "Vintage Scotch" },
  { id: "clip", label: "Brass Paper Clip" },
];

const CHAPTER_STAMPS = [
  "CORE MEMORY",
  "MIDNIGHT LAB",
  "SENIOR CAPSTONE",
  "CAMPUS QUAD",
  "FORMAL GALA",
];

export default function DarkroomComposer({
  isOpen,
  onClose,
  roomId,
  onMemoryPublished,
  editPost = null,
}) {
  const [caption, setCaption] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [localPreview, setLocalPreview] = useState("");
  const [isDeveloping, setIsDeveloping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTape, setSelectedTape] = useState("gold");
  const [selectedStamp, setSelectedStamp] = useState("CORE MEMORY");
  const fileInputRef = useRef(null);
  const currentUser = auth.currentUser;

  // Pre-fill fields if editing an existing post
  useEffect(() => {
    if (editPost) {
      setCaption(editPost.message || "");
      setPhotoUrl(editPost.imageUrls?.[0] || "");
      setLocalPreview(editPost.imageUrls?.[0] || "");
      setSelectedTape(editPost.anchor || "gold");
      setSelectedStamp(editPost.stamp || "CORE MEMORY");
    } else {
      setCaption("");
      setPhotoUrl("");
      setLocalPreview("");
      setSelectedTape("gold");
      setSelectedStamp("CORE MEMORY");
    }
  }, [editPost, isOpen]);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately and trigger developing chemical animation
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setIsDeveloping(true);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "gradgram_preset");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/du1b6818e/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setPhotoUrl(data.secure_url);
      }
    } catch (err) {
      console.error("Darkroom upload failed:", err);
    } finally {
      setIsUploading(false);
      setTimeout(() => setIsDeveloping(false), 2200);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const finalUrl = photoUrl || localPreview;
    if (!finalUrl || !caption.trim() || !roomId) return;

    try {
      const currentUser = auth.currentUser;

      if (editPost && editPost.id) {
        // Edit existing post
        const postRef = doc(db, "rooms", roomId, "posts", editPost.id);
        await updateDoc(postRef, {
          message: caption.trim(),
          imageUrls: [finalUrl],
          anchor: selectedTape,
          stamp: selectedStamp,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new post
        const rotation = ((Math.random() * 4) - 2).toFixed(1);
        await addDoc(collection(db, "rooms", roomId, "posts"), {
          message: caption.trim(),
          imageUrls: [finalUrl],
          anchor: selectedTape,
          stamp: selectedStamp,
          rotation,
          authorId: currentUser?.uid || "anonymous",
          authorName: currentUser?.displayName || "Classmate",
          createdAt: serverTimestamp(),
          reactions: {},
        });
      }

      onMemoryPublished && onMemoryPublished();
      onClose();
    } catch (err) {
      alert("Failed to save memory: " + err.message);
    }
  };

  return (
    <div className="darkroom-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="darkroom-chamber-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.25rem", color: "#fff", margin: 0 }}>
              {editPost ? "Edit Memory Entry ✏️" : "Darkroom Photo Developer 🎞️"}
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--gold-light)" }}>
              {editPost ? "Update your Polaroid caption, photo, or stamp" : "Develop and pin a physical Polaroid memory"}
            </span>
          </div>
          <button className="btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handlePublish}>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoSelect}
          />

          {/* Developing Polaroid Live Canvas */}
          <div className="darkroom-polaroid-preview">
            <div
              className={`polaroid-anchor-tape ${selectedTape}`}
              style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)" }}
            />

            <div
              className="darkroom-photo-screen"
              onClick={() => fileInputRef.current?.click()}
              title="Click to replace photo"
            >
              {localPreview ? (
                <img
                  src={localPreview}
                  alt="Developing frame"
                  className={isDeveloping ? "developing" : ""}
                />
              ) : (
                <div style={{ textAlign: "center", padding: 20, color: "var(--slate-400)" }}>
                  <Camera size={36} color="var(--gold-primary)" style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fff" }}>
                    Select Photo to Develop
                  </div>
                  <div style={{ fontSize: "0.6875rem", marginTop: 4 }}>
                    Click to load 35mm film frame
                  </div>
                </div>
              )}

              {isUploading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    color: "var(--gold-light)",
                    fontSize: "0.8125rem",
                  }}
                >
                  <Loader2 size={18} className="spin-slow" />
                  <span>Developing Emulsion...</span>
                </div>
              )}
            </div>

            {/* Handwritten Chin Input */}
            <textarea
              className="darkroom-chin-input"
              rows={2}
              placeholder="Write handwritten memory caption here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            />
          </div>

          {/* Anchor Tape Picker */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
              Washi Tape Style
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {TAPE_STYLES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`washi-choice-chip ${selectedTape === t.id ? "active" : ""}`}
                  onClick={() => setSelectedTape(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Memory Stamp Category */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 6 }}>
              Chapter Stamp Tag
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CHAPTER_STAMPS.map((st) => (
                <button
                  type="button"
                  key={st}
                  className={`washi-choice-chip ${selectedStamp === st ? "active" : ""}`}
                  onClick={() => setSelectedStamp(st)}
                  style={{ fontFamily: "'Courier New', monospace", fontSize: "0.6875rem" }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isUploading || !caption.trim() || (!photoUrl && !localPreview)}
            >
              {editPost ? <Check size={14} /> : <Send size={14} />}
              <span>{editPost ? "Save Changes" : "Pin to Memory Wall"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
