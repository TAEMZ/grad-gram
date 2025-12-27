import React, { useState } from "react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import "./BackgroundSettings.css";

const PRESET_COLORS = [
  "#22d3ee", "#818cf8", "#f472b6", "#fbbf24", "#34d399", "#94a3b8"
];

function BackgroundSettings({ roomKey, isCreator }) {
  const [color, setColor] = useState("#22d3ee");
  const [uploading, setUploading] = useState(false);

  const handleColorUpdate = async (newColor) => {
    setColor(newColor);
    const db = getFirestore();
    try {
      await updateDoc(doc(db, "rooms", roomKey), {
        background: { type: "color", value: newColor },
        accentColor: newColor // Syncing accent for Atmosphere effect
      });
    } catch (err) {
      console.error(err);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "cloudinary");
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/da7hlicdz/image/upload",
      { method: "POST", body: formData }
    );
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.secure_url;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      const db = getFirestore();
      await updateDoc(doc(db, "rooms", roomKey), {
        background: { type: "image", value: imageUrl },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (!isCreator) return null;

  return (
    <div className="background-settings-panel">
      <div className="settings-group">
        <h4 className="settings-label">Palette</h4>
        <div className="color-presets">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              className={`color-dot ${color === c ? "active" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => handleColorUpdate(c)}
            />
          ))}
          <div className="custom-color-wrapper">
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorUpdate(e.target.value)}
              className="color-input"
            />
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h4 className="settings-label">Visual Atmosphere</h4>
        <label className="image-upload-trigger">
          <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          <span className="upload-text">
            {uploading ? "Weaving atmosphere..." : "Upload Cover Image"}
          </span>
        </label>
      </div>
    </div>
  );
}

export default BackgroundSettings;
