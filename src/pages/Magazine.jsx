import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import PostList from "./PostList";
import "./magazine.css";
import GalleryExport from "../components/GalleryExport";

function Magazine({ roomId, background, isCreator }) {
  const uid = auth.currentUser.uid;
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState([]); // replace imageUrl
  const [preview, setPreview] = useState([]); // replace preview

  const [isUploading, setIsUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [userPosted, setUserPosted] = useState(false);

  // Check if user has already posted
  useEffect(() => {
    const checkUserPost = async () => {
      const q = query(
        collection(db, `rooms/${roomId}/posts`),
        where("authorId", "==", uid)
      );
      const snap = await getDocs(q);
      setUserPosted(!snap.empty);
    };
    checkUserPost();
  }, [roomId, uid]);

  const handleImage = async (e) => {
    const files = Array.from(e.target.files).slice(0, 2);
    if (files.length === 0) return;

    setIsUploading(true);

    const previewList = files.map((f) => URL.createObjectURL(f));
    setPreview(previewList);

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "cloudinary");
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/da7hlicdz/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        return data.secure_url;
      })
    );

    setImageUrl(uploaded);
    setIsUploading(false);
  };

  const resetForm = () => {
    setMessage("");
    setImageUrl([]);
    setPreview([]);
    setEditMode(false);
    setEditPostId(null);
    setUserPosted(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || imageUrl.length === 0) return;

    const postData = {
      message: message.trim(),
      imageUrls: imageUrl, // store both
      updatedAt: serverTimestamp(),
    };

    if (editMode && editPostId) {
      const postRef = doc(db, `rooms/${roomId}/posts`, editPostId);
      await updateDoc(postRef, postData);
    } else {
      await addDoc(collection(db, `rooms/${roomId}/posts`), {
        ...postData,
        authorId: uid,
        authorName: auth.currentUser.displayName,
        authorPhoto: auth.currentUser.photoURL || null,
        createdAt: serverTimestamp(),
        reactions: {},
      });
      setUserPosted(true);
    }

    resetForm();
  };

  const handleEdit = (post) => {
    setMessage(post.message);
    const images = post.imageUrls || []; // Handle potential missing or singular field from older versions if necessary, but prioritize plural
    setImageUrl(images);
    setPreview(images);
    setEditPostId(post.id);
    setEditMode(true);

    // Smooth scroll to editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const backgroundStyle =
    background?.type === "image"
      ? {
        backgroundImage: `url(${background.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
      : {
        backgroundColor: background?.value || "#fff",
      };

  // Sentiment Type-Glow Logic
  const getTypingSentiment = () => {
    const lowMsg = message.toLowerCase();
    if (lowMsg.match(/love|❤️|miss|forever|best/)) return "sentiment-love";
    if (lowMsg.match(/happy|joy|finally|graduated|done|yes/)) return "sentiment-joy";
    if (lowMsg.match(/sad|cry|sorry|bye|😢/)) return "sentiment-sad";
    return "";
  };

  return (
    <div className="magazine-wrapper animate-fade-in">
      <div className={`post-form glass-card ${getTypingSentiment()}`} style={{ transition: 'all 0.5s ease' }}>
        {!userPosted || editMode ? (
          <>
            <h3 className="gradient-text">{editMode ? "Refine Your Memory" : "Share Your Last Words"}</h3>

            {/* Feature 5: Signature Toggle */}
            <div className="signature-toggle" style={{ marginBottom: '24px', textAlign: 'center' }}>
              <button
                type="button"
                className={`toggle-btn ${!imageUrl.length ? "active" : ""}`}
                onClick={() => setImageUrl([])}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                {imageUrl.length > 0 ? "Switch to Signature Mode" : "Digital Autograph Active"}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={imageUrl.length > 0 ? "Inscribe your last words..." : "Leave your signature..."}
                className={`animate-fade-in ${!imageUrl.length ? "signature-font" : ""}`}
              />

              <label htmlFor="imgUpload" className="image-upload-trigger" style={{ marginBottom: '24px' }}>
                <span className="upload-text">
                  {isUploading ? "Processing visual..." : (imageUrl.length > 0 ? `Captured ${imageUrl.length} moments` : "Attach visual memories")}
                </span>
              </label>
              <input
                type="file"
                multiple
                onChange={handleImage}
                accept="image/*"
                id="imgUpload"
              />

              {preview.length > 0 && (
                <div className="preview-container animate-fade-in">
                  <img src={preview[0]} alt="Preview" />
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isUploading}>
                {isUploading
                  ? "Preserving..."
                  : editMode
                    ? "Update Memory"
                    : "Post to Magazine"}
              </button>
            </form>
          </>
        ) : (
          <div className="post-success animate-fade-in" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✨</div>
            <h3 className="gradient-text" style={{ marginBottom: '16px' }}>Memory Preserved</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Your message has been woven into the tapestry of this year's graduation.
            </p>
          </div>
        )}
      </div>

      {isCreator ? (
        <GalleryExport filename={`Room_${roomId}_Gallery.pdf`}>
          <PostList
            roomId={roomId}
            onDelete={resetForm}
            onEdit={handleEdit}
            showPlaceholder={true}
            background={background}
          />
        </GalleryExport>
      ) : (
        <PostList
          roomId={roomId}
          onDelete={resetForm}
          onEdit={handleEdit}
          showPlaceholder={true}
          background={background}
        />
      )}
    </div>
  );
}

export default Magazine;
