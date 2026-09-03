import React, { useState, useRef } from "react";
import { Pencil, Trash2, Heart, ThumbsUp, Laugh, Sparkles, MessageCircle } from "lucide-react";
import "./postcard.css";

const REACTIONS = [
  { label: "❤️", icon: Heart, name: "love" },
  { label: "👍", icon: ThumbsUp, name: "like" },
  { label: "😂", icon: Laugh, name: "laugh" },
  { label: "✨", icon: Sparkles, name: "sparkle" },
];

function PostCard({
  post,
  userEmoji,
  emojiCounts = {},
  canEdit,
  onReact,
  onEdit,
  onDelete,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const galleryRef = useRef(null);

  const counts = REACTIONS.reduce((acc, r) => {
    acc[r.label] = emojiCounts[r.label] || 0;
    return acc;
  }, {});

  const handleScroll = () => {
    if (galleryRef.current) {
      const container = galleryRef.current;
      const scrollPosition = container.scrollLeft;
      const imageWidth = container.offsetWidth;
      if (imageWidth > 0) {
        const newIndex = Math.round(scrollPosition / imageWidth);
        setCurrentImageIndex(newIndex);
      }
    }
  };

  const scrollToImage = (index) => {
    if (galleryRef.current) {
      const container = galleryRef.current;
      const imageWidth = container.offsetWidth;
      container.scrollTo({
        left: index * imageWidth,
        behavior: "smooth",
      });
      setCurrentImageIndex(index);
    }
  };

  const authorSeed = post.authorName || post.authorId || "Graduate";
  const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(authorSeed)}&backgroundColor=141924`;

  // Formatted date if available
  const dateFormatted = post.createdAt?.toDate
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(post.createdAt.toDate())
    : "Memory";

  return (
    <article className="post-card">
      {/* Header */}
      <header className="post-header">
        <div className="author-info">
          <img src={avatarUrl} alt={post.authorName || "Author"} className="author-avatar-img" />
          <div className="author-details">
            <span className="post-author">{post.authorName || "Classmate"}</span>
            <span className="post-date-badge">{dateFormatted}</span>
          </div>
        </div>

        {canEdit && (
          <div className="header-actions">
            {onEdit && (
              <button onClick={() => onEdit(post)} title="Edit Message" className="icon-btn-card">
                <Pencil size={15} />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} title="Remove Memory" className="icon-btn-card danger">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </header>

      {/* Image Gallery */}
      {Array.isArray(post.imageUrls) && post.imageUrls.length > 0 && (
        <div className="post-image-container">
          <div
            className="post-image-dual"
            ref={galleryRef}
            onScroll={handleScroll}
          >
            {post.imageUrls.map((img, idx) => (
              <img key={idx} src={img} alt={`Memory ${idx + 1}`} loading="lazy" />
            ))}
          </div>

          {post.imageUrls.length > 1 && (
            <div className="dots-container">
              {post.imageUrls.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => scrollToImage(idx)}
                  className={`dot ${currentImageIndex === idx ? "active" : ""}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content & Reactions */}
      <div className="post-content">
        <div className="reactions-row">
          {REACTIONS.map((r) => {
            const count = counts[r.label] || 0;
            const isUserSelected = userEmoji === r.label;
            return (
              <button
                key={r.label}
                className={`reaction-pill ${isUserSelected ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onReact && onReact(r.label);
                }}
              >
                <span>{r.label}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="post-message-area">
          <span className="author-name-inline">{post.authorName}</span>
          <span>{post.message}</span>
        </div>
      </div>
    </article>
  );
}

export default PostCard;
