import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc, getFirestore } from "firebase/firestore";

import "./ProfileSection.css";

function ProfileSection({ user }) {
  const [isPublic, setIsPublic] = useState(null); // initially null to show loading state
  const db = getFirestore();

  // Load isPublic value from Firestore on mount
  useEffect(() => {
    if (!user?.uid) return;
    const fetchIsPublic = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setIsPublic(data.isPublic ?? false);
      }
    };
    fetchIsPublic();
  }, [user]);

  // Handle change in dropdown
  const handlePrivacyChange = async (e) => {
    const newValue = e.target.value === "public";
    setIsPublic(newValue);
    await updateDoc(doc(db, "users", user.uid), {
      isPublic: newValue,
    });
  };

  if (isPublic === null) {
    return <div className="profile-section">Loading profile...</div>;
  }

  return (
    <div className="profile-section">
      <div className="avatar-wrapper">
        <img
          className="avatar"
          src={user.photoURL || "/default-avatar.png"}
          alt="Profile"
        />
      </div>
      <div className="user-details">
        <p className="user-name">{user.displayName || "Anonymous"}</p>
        <p className="user-email">{user.email}</p>

        <div className="privacy-toggle">
          <label htmlFor="privacy-select">Profile Visibility:</label>
          <select
            id="privacy-select"
            value={isPublic ? "public" : "private"}
            onChange={handlePrivacyChange}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ProfileSection;
