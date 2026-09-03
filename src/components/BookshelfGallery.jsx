import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import "./bookshelf-gallery.css";
import { getCohortLogo } from "../utils/cohortLogos";

// Helper to convert year to Roman numeral (e.g. 2026 -> MMXXVI)
function toRomanYear(yearStr) {
  const num = parseInt(yearStr, 10);
  if (isNaN(num)) return "MMXXVI";
  const romanMap = [
    { val: 1000, sym: "M" },
    { val: 900, sym: "CM" },
    { val: 500, sym: "D" },
    { val: 400, sym: "CD" },
    { val: 100, sym: "C" },
    { val: 90, sym: "XC" },
    { val: 50, sym: "L" },
    { val: 40, sym: "XL" },
    { val: 10, sym: "X" },
    { val: 9, sym: "IX" },
    { val: 5, sym: "V" },
    { val: 4, sym: "IV" },
    { val: 1, sym: "I" },
  ];
  let n = num;
  let res = "";
  for (const { val, sym } of romanMap) {
    while (n >= val) {
      res += sym;
      n -= val;
    }
  }
  return res || "MMXXVI";
}

// Miniature Academic Mortarboard Graduation Cap Component
function MiniGraduationCap() {
  return (
    <div className="book-grad-cap" aria-hidden="true">
      <svg
        viewBox="0 0 48 36"
        width="48"
        height="36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="capBoardGrad" x1="2" y1="2" x2="46" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2c3545" />
            <stop offset="50%" stopColor="#151b26" />
            <stop offset="100%" stopColor="#080c14" />
          </linearGradient>
          <linearGradient id="capBevelGrad" x1="2" y1="12" x2="46" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0b0f17" />
            <stop offset="100%" stopColor="#020408" />
          </linearGradient>
          <linearGradient id="capSkullGrad" x1="14" y1="18" x2="34" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#0a0d14" />
          </linearGradient>
          <linearGradient id="capGoldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <filter id="capDropShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* 1. Skull Base (anchored atop the curved spine edge) */}
        <path
          d="M 14 18 C 14 27 34 27 34 18 Z"
          fill="url(#capSkullGrad)"
          stroke="rgba(245, 158, 11, 0.35)"
          strokeWidth="0.8"
        />

        {/* 2. Mortarboard 3D Thickness Bevel */}
        <path
          d="M 2 11 L 24 20 L 46 11 L 46 13.5 L 24 22.5 L 2 13.5 Z"
          fill="url(#capBevelGrad)"
        />

        {/* 3. Mortarboard Diamond Top Plane */}
        <path
          d="M 24 2 L 46 11 L 24 20 L 2 11 Z"
          fill="url(#capBoardGrad)"
          stroke="rgba(245, 158, 11, 0.45)"
          strokeWidth="0.8"
          filter="url(#capDropShadow)"
        />

        {/* 4. Center Gold Button Stud */}
        <circle cx="24" cy="11" r="2.2" fill="url(#capGoldGrad)" />

        {/* 5. Gold Silk Braided Tassel */}
        <g className="cap-tassel">
          <path
            d="M 24 11 Q 38 12 40 18"
            stroke="url(#capGoldGrad)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="40" cy="19" r="1.6" fill="url(#capGoldGrad)" />
          <path
            d="M 39 20 L 37.5 32 L 42.5 32 L 41 20 Z"
            fill="url(#capGoldGrad)"
          />
        </g>
      </svg>
    </div>
  );
}

// Authentic Heritage University Leather Palettes for all 22 Global Cohorts
function getUniversityTheme(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("harvard") || lower.includes("cornell")) {
    return {
      bg: "linear-gradient(135deg, #3e0f17 0%, #20070b 70%, #0d0305 100%)",
      spine: "linear-gradient(90deg, #120306 0%, #3e0f17 35%, #591621 50%, #290a0f 75%, #120306 100%)",
    };
  }
  if (lower.includes("oxford") || lower.includes("yale") || lower.includes("toronto")) {
    return {
      bg: "linear-gradient(135deg, #0c1b33 0%, #060e1c 70%, #02060d 100%)",
      spine: "linear-gradient(90deg, #030812 0%, #0c1b33 35%, #142b52 50%, #081324 75%, #030812 100%)",
    };
  }
  if (lower.includes("cambridge") || lower.includes("sorbonne")) {
    return {
      bg: "linear-gradient(135deg, #0e2a1f 0%, #071711 70%, #030a07 100%)",
      spine: "linear-gradient(90deg, #040d09 0%, #0e2a1f 35%, #143d2c 50%, #091c14 75%, #040d09 100%)",
    };
  }
  if (lower.includes("stanford") || lower.includes("nus")) {
    return {
      bg: "linear-gradient(135deg, #441218 0%, #26090d 70%, #120406 100%)",
      spine: "linear-gradient(90deg, #140407 0%, #441218 35%, #631922 50%, #2e0c10 75%, #140407 100%)",
    };
  }
  if (lower.includes("mit") || lower.includes("caltech") || lower.includes("eth")) {
    return {
      bg: "linear-gradient(135deg, #1c2430 0%, #0f141c 70%, #07090d 100%)",
      spine: "linear-gradient(90deg, #070a0e 0%, #1c2430 35%, #293547 50%, #161c26 75%, #070a0e 100%)",
    };
  }
  if (lower.includes("princeton") || lower.includes("berkeley")) {
    return {
      bg: "linear-gradient(135deg, #2b1a0e 0%, #180d06 70%, #0a0502 100%)",
      spine: "linear-gradient(90deg, #0d0603 0%, #2b1a0e 35%, #3d2514 50%, #1c1009 75%, #0d0603 100%)",
    };
  }
  if (lower.includes("tokyo") || lower.includes("imperial") || lower.includes("tsinghua")) {
    return {
      bg: "linear-gradient(135deg, #19142c 0%, #0e0b1a 70%, #06040c 100%)",
      spine: "linear-gradient(90deg, #06040c 0%, #19142c 35%, #271f45 50%, #130f24 75%, #06040c 100%)",
    };
  }
  if (lower.includes("columbia") || lower.includes("edinburgh") || lower.includes("johns hopkins")) {
    return {
      bg: "linear-gradient(135deg, #0f233a 0%, #081320 70%, #03080e 100%)",
      spine: "linear-gradient(90deg, #04090f 0%, #0f233a 35%, #18375c 50%, #0b1a2c 75%, #04090f 100%)",
    };
  }
  if (lower.includes("worabe")) {
    return {
      bg: "linear-gradient(135deg, #141e30 0%, #0c121e 70%, #06090f 100%)",
      spine: "linear-gradient(90deg, #06090f 0%, #141e30 35%, #20304c 50%, #101827 75%, #06090f 100%)",
    };
  }
  // Default Hawassa University (Imperial Obsidian & Gold)
  return {
    bg: "linear-gradient(135deg, #182233 0%, #0d121c 70%, #06090e 100%)",
    spine: "linear-gradient(90deg, #080c14 0%, #182233 35%, #233149 50%, #131b29 75%, #080c14 100%)",
  };
}

export default function BookshelfGallery({ rooms = [] }) {
  const navigate = useNavigate();
  const [hoveredBookId, setHoveredBookId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopyKey = (key, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Sort Hawassa University first, followed by other cohorts
  const sortedRooms = [...rooms].sort((a, b) => {
    const aHawassa = (a.university || "").toLowerCase().includes("hawassa");
    const bHawassa = (b.university || "").toLowerCase().includes("hawassa");
    if (aHawassa && !bHawassa) return -1;
    if (!aHawassa && bHawassa) return 1;
    return 0;
  });

  // Chunk books into shelves of 7 books per tier
  const BOOKS_PER_SHELF = 7;
  const shelfTiers = [];
  for (let i = 0; i < sortedRooms.length; i += BOOKS_PER_SHELF) {
    shelfTiers.push(sortedRooms.slice(i, i + BOOKS_PER_SHELF));
  }

  return (
    <div className="bookshelf-stage animate-fade-in">
      {shelfTiers.map((shelfRooms, tierIdx) => (
        <div key={`tier-${tierIdx}`} className="bookshelf-tier">
          <div className="shelf-tier-indicator">
            <span>Shelf {tierIdx + 1}</span>
          </div>

          {/* 3D Books Standing on this Shelf Tier */}
          <div className="bookshelf-rack">
            {shelfRooms.map((room, idx) => {
              const initial = room.university?.[0]?.toUpperCase() || "U";
              const romanEdition = toRomanYear(room.gradYear || "2026");
              const isHovered = hoveredBookId === room.id;
              const theme = getUniversityTheme(room.university);
              const crestLogo = getCohortLogo(room);

              return (
                <div
                  key={room.id}
                  className="standing-3d-book-wrapper stance-upright"
                  onMouseEnter={() => setHoveredBookId(room.id)}
                  onMouseLeave={() => setHoveredBookId(null)}
                  onClick={() => navigate(`/room/${room.id}`)}
                  style={{ zIndex: isHovered ? 80 : shelfRooms.length - idx }}
                >
                  {/* Dynamic Shelf Shadow */}
                  <div className="book-shelf-shadow" />

                  {/* The Cambridge-Style 3D Book Volume */}
                  <div className="book-3d-volume">
                    {/* Commemorative Academic Mortarboard Graduation Cap */}
                    <MiniGraduationCap />

                    {/* ================= 1. CURVED SPINE FACE (LEFT) ================= */}
                    <div className="book-face-spine" style={{ background: theme.spine }}>
                      <div className="spine-raised-rib" />

                      <div className="spine-crest-circle">
                        {crestLogo ? (
                          <img
                            src={crestLogo}
                            alt={room.university}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                          />
                        ) : (
                          <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 800, color: "var(--gold-light)" }}>{initial}</span>
                        )}
                      </div>

                      <div className="spine-raised-rib" />

                      <div className="spine-vertical-text">
                        {room.university} · {room.department}
                      </div>

                      <div className="spine-raised-rib" />

                      <div className="spine-bottom-vol">
                        VOL. {romanEdition}
                      </div>

                      <div className="spine-raised-rib" />
                    </div>

                    {/* ================= 2. BROAD COVER FACE (RIGHT, JOINED) ================= */}
                    <div className="book-face-cover" style={{ background: theme.bg }}>
                      {/* Commemorative Academic Honors Satin Ribbon ("Rivaan") */}
                      <div className="book-honors-ribbon">
                        <div className="ribbon-gold-emboss" />
                      </div>

                      <div className="cover-embossed-border">
                        <div className="cover-header-group">
                          <div className="cover-crest-emblem">
                            {crestLogo ? (
                              <img
                                src={crestLogo}
                                alt={room.university}
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                              />
                            ) : (
                              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 800, color: "var(--gold-light)" }}>{initial}</span>
                            )}
                          </div>
                          <div className="cover-univ-title">{room.university}</div>
                          <div className="cover-dept-title">{room.department}</div>
                        </div>

                        <div className="cover-roman-vol">VOL. {romanEdition}</div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Popover Card */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        className="book-hover-popover"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h4>{room.university}</h4>
                        <div className="book-hover-dept">
                          {room.department} · Class of {room.gradYear || "2026"}
                        </div>

                        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "4px 8px", fontSize: "0.6875rem", pointerEvents: "auto" }}
                            onClick={(e) => handleCopyKey(room.id, e)}
                            title="Copy cohort passkey"
                          >
                            {copiedKey === room.id ? (
                              <Check size={12} color="#4ade80" />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>{copiedKey === room.id ? "Copied" : "Passkey"}</span>
                          </button>

                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: "4px 10px", fontSize: "0.6875rem", pointerEvents: "auto" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/room/${room.id}`);
                            }}
                          >
                            <span>Open</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>

                        <div style={{ fontSize: "0.6875rem", color: "var(--gold-light)", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <BookOpen size={11} />
                          <span>Click to open 3D flipbook</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Modern Grey Slate & Titanium Shelf Ledge Beam */}
          <div className="bookshelf-ledge" />
        </div>
      ))}
    </div>
  );
}
