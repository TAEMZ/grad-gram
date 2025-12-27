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

  return (
    <div className="postlist-container">
      {posts.length === 0 && showPlaceholder ? (
        <div className="empty-state-container animate-fade-in">
          <div className="sparkle-icon">✨</div>
          <h2 className="empty-title">A Silent Chapter</h2>
          <p className="empty-subtitle">
            Be the first to leave your mark on this digital archive.
          </p>
        </div>
      ) : (
        <>
          <div className="feed-header animate-fade-in">
            <h2 className="feed-title">Room Memories</h2>
            <div className="feed-stats">
              <span>{posts.length} Stories Captured</span>
            </div>
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
        </>
      )}
    </div>
  );
}
