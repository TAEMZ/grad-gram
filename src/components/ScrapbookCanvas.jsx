import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Move, Pin, GraduationCap } from "lucide-react";
import "./scrapbook-canvas.css";

const DEFAULT_MEMORIES = [
  {
    id: "m1",
    type: "polaroid",
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600",
    caption: "Late night study session at Main Hall ☕",
    author: "Elena",
    defaultX: 80,
    defaultY: 90,
    rotate: -4,
  },
  {
    id: "m2",
    type: "polaroid",
    img: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600",
    caption: "Engineering Capstone presentation day!",
    author: "Marcus",
    defaultX: 380,
    defaultY: 130,
    rotate: 5,
  },
  {
    id: "m3",
    type: "polaroid",
    img: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?q=80&w=600",
    caption: "Campus Quad in the autumn sunlight 🍂",
    author: "Sarah",
    defaultX: 680,
    defaultY: 80,
    rotate: -2,
  },
  {
    id: "m4",
    type: "sticky",
    text: "Never forget: we survived 8:00 AM Physics lectures on 3 hours of sleep! 🚀",
    author: "David",
    defaultX: 180,
    defaultY: 380,
    rotate: 3,
    color: "#fef08a",
  },
  {
    id: "m5",
    type: "sticky",
    text: "To the Class of '26: Let's build the future together! See you in SF & NYC! 🌟",
    author: "Jessica",
    defaultX: 520,
    defaultY: 390,
    rotate: -5,
    color: "#fbcfe8",
  },
];

export default function ScrapbookCanvas({ posts = [] }) {
  const containerRef = useRef(null);

  // Combine real posts with default canvas items
  const canvasItems = [
    ...DEFAULT_MEMORIES,
    ...posts.slice(0, 4).map((p, idx) => ({
      id: p.id || `post-${idx}`,
      type: "polaroid",
      img: p.imageUrls?.[0] || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600",
      caption: p.message || "Class Memory",
      author: p.authorName || "Classmate",
      defaultX: 250 + (idx % 3) * 220,
      defaultY: 200 + Math.floor(idx / 3) * 180,
      rotate: (idx % 2 === 0 ? 3 : -3),
    })),
  ];

  return (
    <div className="scrapbook-tabletop-container animate-fade-in" ref={containerRef}>
      {/* Tabletop Controls & Hint */}
      <div className="scrapbook-controls-bar">
        <div className="scrapbook-hint-badge">
          <Move size={14} />
          <span>Interactive Canvas: Click and drag memories to arrange</span>
        </div>
      </div>

      {/* Floating Draggable Items */}
      {canvasItems.map((item) => {
        if (item.type === "polaroid") {
          return (
            <motion.div
              key={item.id}
              drag
              dragConstraints={containerRef}
              dragElastic={0.1}
              initial={{
                x: item.defaultX,
                y: item.defaultY,
                rotate: item.rotate,
                scale: 0.95,
              }}
              whileHover={{ scale: 1.04, zIndex: 30 }}
              whileDrag={{ scale: 1.08, zIndex: 50 }}
              className="draggable-polaroid-item"
            >
              <img
                src={item.img}
                alt="Polaroid Memory"
                className="draggable-polaroid-photo"
                draggable={false}
              />
              <div className="draggable-polaroid-caption">{item.caption}</div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: "#64748b",
                  marginTop: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>– {item.author}</span>
                <span>📌 Pinned</span>
              </div>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={item.id}
            drag
            dragConstraints={containerRef}
            dragElastic={0.1}
            initial={{
              x: item.defaultX,
              y: item.defaultY,
              rotate: item.rotate,
              scale: 0.95,
            }}
            whileHover={{ scale: 1.04, zIndex: 30 }}
            whileDrag={{ scale: 1.08, zIndex: 50 }}
            className="draggable-sticky-note"
            style={{ background: item.color || "#fef08a" }}
          >
            <div>{item.text}</div>
            <div
              style={{
                fontSize: "0.6875rem",
                opacity: 0.8,
                marginTop: "8px",
                textAlign: "right",
              }}
            >
              – {item.author}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
