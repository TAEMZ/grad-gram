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

  const handleNext = () => {
    if (post.imageUrls && currentImageIndex < post.imageUrls.length - 1) {
      scrollToImage(currentImageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentImageIndex > 0) {
      scrollToImage(currentImageIndex - 1);
    }
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

  return (
    <div className="post-card">
      <div className="post-header"></div>
      {canEdit && (
        <div
          className="action-buttons"
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
        >
          <button
            className="action-btn edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post);
            }}
            title="Edit post"
            tabIndex="0"
          >
            ✏️
          </button>
          <button
            className="action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete post"
            tabIndex="0"
          >
            🗑️
          </button>
        </div>
      )}

      {Array.isArray(post.imageUrls) && post.imageUrls.length > 0 && (
        <div className="post-image-container">
          <div
            className="post-image-dual"
            ref={galleryRef}
            onScroll={handleScroll}
          >
            {post.imageUrls.map((img, idx) => (
              <img key={idx} src={img} alt={`Post ${idx + 1}`} />
            ))}
          </div>

          {post.imageUrls.length > 1 && (
            <>
              <button
                className="nav-arrow left"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                disabled={currentImageIndex === 0}
              >
                ‹
              </button>
              <button
                className="nav-arrow right"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                disabled={currentImageIndex === post.imageUrls.length - 1}
              >
                ›
              </button>
              <div className="dots-container">
                {post.imageUrls.map((_, idx) => (
                  <div
                    key={idx}
                    className={`dot ${
                      currentImageIndex === idx ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToImage(idx);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {post.imageUrl && !Array.isArray(post.imageUrls) && (
        <div className="post-image">
          <img src={post.imageUrl} alt="Post visual" />
        </div>
      )}

      <div className="post-content">
        <p className="post-message">"{post.message}"</p>

        <div className="post-footer">
          <span className="post-author">– {post.authorName}</span>
        </div>

        <div className="reactions">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className={`emoji-btn ${userEmoji === emoji ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onReact(emoji);
              }}
              title={`React with ${emoji}`}
            >
              <span>{emoji}</span>
              {counts[emoji] > 0 && (
                <span className="emoji-count">{counts[emoji]}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostCard;
