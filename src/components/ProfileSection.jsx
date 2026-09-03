import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { User, Compass, GraduationCap, X, Check, Save } from "lucide-react";
import "./ProfileSection.css";

function ProfileSection({ isOpen, onClose, onProfileUpdated }) {
  const [displayName, setDisplayName] = useState("");
  const [nextChapter, setNextChapter] = useState("");
  const [classYear, setClassYear] = useState("2026");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const db = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid || !isOpen) return;

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data.displayName || user.displayName || "");
          setNextChapter(data.nextChapter || "");
          setClassYear(data.classYear || "2026");
          setBio(data.bio || "");
          setIsPublic(data.isPublic ?? true);
        } else {
          setDisplayName(user.displayName || "");
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };

    fetchUserProfile();
  }, [user, isOpen, db]);

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update Firebase Auth displayName if changed
      if (displayName && displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      // 2. Persist to Firestore users/{uid}
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          displayName: displayName.trim(),
          email: user.email || "",
          nextChapter: nextChapter.trim(),
          classYear: classYear.trim(),
          bio: bio.trim(),
          isPublic,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setSavedSuccess(true);
      onProfileUpdated?.();
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      alert("Failed to save profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
    displayName || user.email || "Graduate"
  )}&backgroundColor=141924`;

  return (
    <div className="profile-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3>Graduate Profile Settings</h3>
          <button className="btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="profile-avatar-preview">
          <img src={avatarUrl} alt="Avatar" className="profile-avatar-img-large" />
          <div>
            <h4 style={{ color: "#fff", fontSize: "1rem", marginBottom: 2 }}>
              {displayName || "Graduate"}
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
              {user.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="profile-form-grid">
          <div className="profile-form-group">
            <label htmlFor="display-name-input">Full Name</label>
            <input
              id="display-name-input"
              type="text"
              className="input-base"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Chen"
              required
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="next-chapter-input">Next Chapter / Destination</label>
            <input
              id="next-chapter-input"
              type="text"
              className="input-base"
              value={nextChapter}
              onChange={(e) => setNextChapter(e.target.value)}
              placeholder="e.g. Software Engineer @ Google / MIT Grad School"
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="class-year-input">Graduating Class Year</label>
            <input
              id="class-year-input"
              type="text"
              className="input-base"
              value={classYear}
              onChange={(e) => setClassYear(e.target.value)}
              placeholder="e.g. 2026"
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="bio-input">Senior Bio / Quote</label>
            <input
              id="bio-input"
              type="text"
              className="input-base"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. To the nights that turned into mornings with friends."
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="visibility-select">Directory Visibility</label>
            <select
              id="visibility-select"
              className="input-base"
              value={isPublic ? "public" : "private"}
              onChange={(e) => setIsPublic(e.target.value === "public")}
            >
              <option value="public">Public (Visible in classmate search & directory)</option>
              <option value="private">Private (Only visible in your joined rooms)</option>
            </select>
          </div>

          <div className="profile-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              {savedSuccess ? (
                <>
                  <Check size={14} color="#4ade80" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>{saving ? "Saving..." : "Save Profile"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSection;
