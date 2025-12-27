import React, { useState, useRef } from "react";
import "./postcard.css";

const EMOJIS = ["👍", "❤️", "😂", "😢"];

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
  const counts = EMOJIS.reduce((acc, emoji) => {
    acc[emoji] = emojiCounts[emoji] || 0;
    return acc;
  }, {});

  // Temporal Aging Logic
  const isOld = post.createdAt && (Date.now() - post.createdAt.toMillis() > 1000 * 60 * 60 * 48); // Older than 48 hours

  // Determine sentiment class based on current reactions
  const getSentimentClass = () => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return "";

    const maxEmoji = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    if (maxEmoji === "❤️" && counts["❤️"] > 0) return "sentiment-love";
    if (maxEmoji === "👍" && counts["👍"] > 0) return "sentiment-joy";
    if (maxEmoji === "😢" && counts["😢"] > 0) return "sentiment-sad";
    return "";
  };

  const handleScroll = () => {
    if (galleryRef.current) {
      const container = galleryRef.current;
      const scrollPosition = container.scrollLeft;
      const imageWidth = container.offsetWidth;
      const newIndex = Math.round(scrollPosition / imageWidth);
      setCurrentImageIndex(newIndex);
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

  const [animatingEmoji, setAnimatingEmoji] = useState(null);

  const handleReactClick = (emoji) => {
    setAnimatingEmoji(emoji);
    onReact(emoji);
    setTimeout(() => setAnimatingEmoji(null), 400); // Reset animation state
  };

  return (
    <div className={`post-card ${getSentimentClass()} ${isOld ? "temporal-old" : ""}`}>
      {/* Header: Author & Actions */}
      <div className="post-header">
        <div className="author-info">
          <div className="author-avatar">{post.authorName ? post.authorName[0].toUpperCase() : "?"}</div>
          <div className="author-details">
            <span className="post-author">{post.authorName}</span>
            {post.isFirstPost && (
              <span className="tassel-badge" title="First Contribution Milestone">
                ✨ First Post
              </span>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="header-actions">
            <button onClick={() => onEdit(post)} title="Edit Message" className="icon-btn">✏️</button>
            <button onClick={onDelete} title="Remove Memory" className="icon-btn">🗑️</button>
          </div>
        )}
      </div>

      {Array.isArray(post.imageUrls) && post.imageUrls.length > 0 && (
        <div className="post-image-container">
          <div
            className="post-image-dual"
            ref={galleryRef}
            onScroll={handleScroll}
          >
            {post.imageUrls.map((img, idx) => (
              <img key={idx} src={img} alt={`Memory ${idx + 1}`} />
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

      {/* Footer Content: Actions Row & Message */}
      <div className="post-content">
        <div className="reactions-row">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className={`emoji-btn ${userEmoji === emoji ? "active" : ""} ${animatingEmoji === emoji ? "hyper-reaction" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleReactClick(emoji);
              }}
            >
              <span>{emoji}</span>
              {counts[emoji] > 0 && (
                <span className="emoji-count">{counts[emoji]}</span>
              )}
            </button>
          ))}
        </div>

        <div className="post-message-area">
          <span className="author-name-inline">{post.authorName}</span>
          <span className="post-message-text"> {post.message}</span>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
