import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import PostCard from "./PostCard";
import "./postlist.css";

export default function PostList({
  roomId,
  onDelete,
  onEdit,
  showPlaceholder = true,
  background,
}) {
  const [posts, setPosts] = useState([]);
  const uid = auth.currentUser.uid;

  useEffect(() => {
    const q = query(collection(db, "rooms", roomId, "posts"));
    return onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(
        arr.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
      );
    });
  }, [roomId]);

  const handleReact = async (postId, emoji) => {
    const post = posts.find((p) => p.id === postId);
    const reactions = { ...(post.reactions || {}) };

    if (reactions[uid] === emoji) {
      delete reactions[uid]; // remove reaction if clicked again
    } else {
      reactions[uid] = emoji; // assign new reaction
    }

    await updateDoc(doc(db, "rooms", roomId, "posts", postId), { reactions });
  };

  const handleDelete = async (postId) => {
    await deleteDoc(doc(db, "rooms", roomId, "posts", postId));
    onDelete?.();
  };

  const backgroundStyle =
    background?.type === "image"
      ? {
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${background.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }
      : {
          backgroundColor: background?.value || "#f8f9fa",
        };

  return (
    <div className="postlist-container" style={backgroundStyle}>
      {posts.length === 0 && showPlaceholder ? (
        <div className="empty-state-container">
          <h2 className="empty-title">Welcome to Your Creative Space!</h2>
          <p className="empty-subtitle">
            No posts yet. Be the first to share your thoughts!
          </p>
          <div className="decoration-sparkles">✨</div>
          <p className="empty-encouragement">
            Your words could inspire others. Start the conversation!
          </p>
        </div>
      ) : (
        <>
          <div className="celebration-banner">
            <h2 className="celebration-title">Amazing Contributions!</h2>
            <p className="celebration-subtitle">
              Congratulations on building such a vibrant community!
            </p>
          </div>

          <div className="posts-grid">
            {posts.map((p) => {
              const userEmoji = p.reactions?.[uid] || "";
              const counts = { "👍": 0, "❤️": 0, "😂": 0, "😢": 0 };
              Object.values(p.reactions || {}).forEach((e) => {
                if (counts[e] !== undefined) counts[e]++;
              });

              return (
                <PostCard
                  key={p.id}
                  post={p}
                  userEmoji={userEmoji}
                  emojiCounts={counts}
                  canEdit={p.authorId === uid}
                  onReact={(emoji) => handleReact(p.id, emoji)}
                  onDelete={() => handleDelete(p.id)}
                  onEdit={() => onEdit(p)}
                />
              );
            })}
          </div>

          {posts.length > 3 && (
            <div className="congratulations-footer">
              <div className="confetti">🎉</div>
              <p>You've viewed all {posts.length} amazing posts!</p>
              <div className="confetti">🎊</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
