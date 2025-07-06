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
    setImageUrl(post.imageUrl);
    setPreview(post.imageUrl);
    setEditPostId(post.id);
    setEditMode(true);
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

  return (
    <div className="magazine-wrapper" style={backgroundStyle}>
      <div className="post-form">
        {!userPosted || editMode ? (
          <>
            <h3>{editMode ? "Edit Your Post" : "Share Your Last Words"}</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write something heartfelt..."
              />
              <input
                type="file"
                multiple
                onChange={handleImage}
                accept="image/*"
                id="imgUpload"
              />
              {preview && (
                <div className="preview-container">
                  <img src={preview} alt="Preview" />
                </div>
              )}
              <button type="submit" disabled={isUploading}>
                {isUploading
                  ? "Uploading..."
                  : editMode
                  ? "Update Post"
                  : "Post"}
              </button>
            </form>
          </>
        ) : (
          <p style={{ color: "black" }}>
            You’ve already posted. You can edit your post below.
          </p>
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
