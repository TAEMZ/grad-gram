import React, { useState } from "react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

function BackgroundSettings({ roomKey, isCreator }) {
  const [color, setColor] = useState("#ffffff");
  const [uploading, setUploading] = useState(false);

  const handleColorChange = async () => {
    const db = getFirestore();
    await updateDoc(doc(db, "rooms", roomKey), {
      background: { type: "color", value: color },
    });
    alert("Background color updated");
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "cloudinary"); // Replace with your actual preset
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/da7hlicdz/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Upload to Cloudinary failed");
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

      alert("Background image uploaded");
    } catch (err) {
      console.error(err);
      alert("Failed to upload background image");
    } finally {
      setUploading(false);
    }
  };

  if (!isCreator) return null;

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Customize Background</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>Pick Background Color: </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button onClick={handleColorChange}>Set Color</button>
      </div>

      <div>
        <label>Upload Background Image: </label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      {uploading && <p>Uploading...</p>}
    </div>
  );
}

export default BackgroundSettings;
