import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Trophy,
  PenTool,
  MapPin,
  Lock,
  Compass,
  ArrowRight,
} from "lucide-react";
import "./yearbook-book.css";
import { getCohortLogo } from "../utils/cohortLogos";

// Synthesize tactile paper rustle sound via Web Audio API
const playPageTurnSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // White noise buffer simulating paper rustle
    const bufferSize = ctx.sampleRate * 0.12; // 120ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to paper scrape band
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (e) {}
};

const CHAPTERS = [
  { id: 0, title: "I. Proem & Roster", subtitle: "The Classmate Register" },
  { id: 1, title: "II. Memory Spreads", subtitle: "Stories & Candid Moments" },
  { id: 2, title: "III. Honors & Superlatives", subtitle: "Cohort Laureates" },
  { id: 3, title: "IV. Autograph Margins", subtitle: "Peer Dedications" },
  { id: 4, title: "V. Relocation & Vault", subtitle: "The 2031 Time Capsule" },
];

export default function YearbookBook({
  roomData,
  members = [],
  posts = [],
  onOpenAutographs,
  onOpenAlumni,
  onOpenSuperlatives,
  onOpenTimeCapsule,
}) {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [flipDirection, setFlipDirection] = useState(1); // 1 = forward, -1 = backward

  const goToNextSpread = () => {
    if (currentSpread < CHAPTERS.length - 1) {
      playPageTurnSound();
      setFlipDirection(1);
      setCurrentSpread((prev) => prev + 1);
    }
  };

  const goToPrevSpread = () => {
    if (currentSpread > 0) {
      playPageTurnSound();
      setFlipDirection(-1);
      setCurrentSpread((prev) => prev - 1);
    }
  };

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") goToNextSpread();
      if (e.key === "ArrowLeft") goToPrevSpread();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSpread]);

  const gradYear = roomData?.gradYear || "2026";
  const university = roomData?.university || "University";
  const department = roomData?.department || "Department";
  const cohortLogo = getCohortLogo(roomData);

  return (
    <div className="yearbook-3d-stage animate-fade-in">
      {/* 3D Hardcover Book Enclosure */}
      <div className="yearbook-hardcover-wrapper">
        {/* Silk Bookmark Ribbon */}
        <div className="silk-bookmark-ribbon" />

        {/* Double-Page Spread */}
        <div className="yearbook-open-spread">
          {/* Leather / Paper Spine Center Gutter */}
          <div className="book-spine-gutter" />

          {/* Page Turn Interactive Corner Buttons */}
          {currentSpread > 0 && (
            <button
              className="page-corner-turn-btn left"
              onClick={goToPrevSpread}
              title="Turn to previous chapter (Arrow Left)"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {currentSpread < CHAPTERS.length - 1 && (
            <button
              className="page-corner-turn-btn right"
              onClick={goToNextSpread}
              title="Turn to next chapter (Arrow Right)"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Animated Chapter Spread Content */}
          <AnimatePresence mode="wait" custom={flipDirection}>
            <motion.div
              key={currentSpread}
              custom={flipDirection}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ display: "flex", width: "100%", minHeight: "100%" }}
            >
              {/* SPREAD 1: PROEM & CLASSMATE ROSTER */}
              {currentSpread === 0 && (
                <>
                  {/* Left Page: Proclamation & Crest */}
                  <div className="book-page-half left-page">
                    <div>
                      <div className="page-folio-header">
                        <span className="chapter-roman-numeral">Liber I</span>
                        <span className="chapter-running-head">{university}</span>
                      </div>

                      <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
                        <div
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: "50%",
                            background: "radial-gradient(circle, #fef3c7, #f59e0b)",
                            border: "2px double #b45309",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                            boxShadow: "0 6px 16px rgba(180, 83, 9, 0.25)",
                            overflow: "hidden",
                          }}
                        >
                          {cohortLogo ? (
                            <img
                              src={cohortLogo}
                              alt={university}
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                          ) : (
                            <GraduationCap size={36} color="#78350f" />
                          )}
                        </div>

                        <h1
                          style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: "1.75rem",
                            fontWeight: 800,
                            color: "#1e293b",
                            lineHeight: 1.2,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {university}
                        </h1>
                        <p
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "1.05rem",
                            fontStyle: "italic",
                            color: "#b45309",
                            marginTop: 4,
                          }}
                        >
                          {department} · Class of {gradYear}
                        </p>
                      </div>

                      <div
                        style={{
                          borderLeft: "2px solid #d97706",
                          paddingLeft: "16px",
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "0.9375rem",
                          lineHeight: "1.6",
                          color: "#334155",
                          fontStyle: "italic",
                          margin: "16px 0",
                        }}
                      >
                        "Let these pages stand as an immortal testament to the scholars, visionaries, and companions of our graduating class. Though our horizons diverge across oceans and cities, our shared journey remains etched in memory."
                      </div>
                    </div>

                    <div className="page-folio-footer">
                      <span>Proem & Dedication</span>
                      <span>Page i</span>
                    </div>
                  </div>

                  {/* Right Page: Classmate Roster */}
                  <div className="book-page-half right-page">
                    <div>
                      <div className="page-folio-header">
                        <span className="chapter-roman-numeral">Roster</span>
                        <span className="chapter-running-head">Classmate Registry</span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                          maxHeight: "440px",
                          overflowY: "auto",
                          paddingRight: "8px",
                        }}
                      >
                        {members.slice(0, 12).map((m) => {
                          const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
                            m.displayName || m.uid
                          )}&backgroundColor=fef3c7`;

                          return (
                            <div
                              key={m.uid}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "6px 8px",
                                background: "rgba(0, 0, 0, 0.03)",
                                borderRadius: "6px",
                                border: "1px solid rgba(0, 0, 0, 0.06)",
                              }}
                            >
                              <img
                                src={avatarUrl}
                                alt={m.displayName}
                                style={{ width: 26, height: 26, borderRadius: "50%" }}
                              />
                              <div style={{ overflow: "hidden" }}>
                                <div
                                  style={{
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    color: "#0f172a",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                  }}
                                >
                                  {m.displayName}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.6875rem",
                                    color: "#64748b",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                  }}
                                >
                                  {m.nextChapter || "Graduate"}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="page-folio-footer">
                      <span>{members.length} Registered Laureates</span>
                      <span>Page ii</span>
                    </div>
                  </div>
                </>
              )}

              {/* SPREAD 2: MEMORY STORIES & POLAROID COLLAGE */}
              {currentSpread === 1 && (
                <>
                  {/* Left Page: Editorial Story Highlight */}
                  <div className="book-page-half left-page">
                    <div>
                      <div className="page-folio-header">
                        <span className="chapter-roman-numeral">Liber II</span>
                        <span className="chapter-running-head">The Chronicles</span>
                      </div>

                      <h3
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "1.4rem",
                          fontWeight: 700,
                          color: "#1e293b",
                          marginBottom: 10,
                        }}
                      >
                        Midnight Library Sessions & Milestone Moments
                      </h3>

                      <p style={{ fontSize: "0.875rem", lineHeight: "1.6", color: "#475569", marginBottom: 16 }}>
                        From the nerve-wracking freshman orientation to capstone presentations in the grand auditorium, our cohort shared triumph, laughter, and endless coffee.
                      </p>

                      <div
                        style={{
                          background: "#fef3c7",
                          padding: "14px 18px",
                          borderRadius: "8px",
                          border: "1px dashed #d97706",
                          fontFamily: "'Caveat', cursive",
                          fontSize: "1.25rem",
                          color: "#78350f",
                        }}
                      >
                        "Years will pass, but the sound of our campus bells and late-night campus debates will forever echo in our memories."
                      </div>
                    </div>

                    <div className="page-folio-footer">
                      <span>Memories & Stories</span>
                      <span>Page iii</span>
                    </div>
                  </div>

                  {/* Right Page: Polaroid Cluster */}
                  <div className="book-page-half right-page">
                    <div>
                      <div className="page-folio-header">
                        <span className="chapter-roman-numeral">Collage</span>
                        <span className="chapter-running-head">Candid Frames</span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "16px",
                        }}
                      >
                        {posts.slice(0, 4).map((post, idx) => {
                          const rotation = idx % 2 === 0 ? -2 : 2;
                          const img = post.imageUrls?.[0] || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600";

                          return (
                            <div
                              key={post.id || idx}
                              style={{
                                background: "#ffffff",
                                padding: "8px 8px 16px",
                                boxShadow: "0 6px 14px rgba(0, 0, 0, 0.15)",
                                transform: `rotate(${rotation}deg)`,
                                borderRadius: "2px",
                              }}
                            >
                              <img
                                src={img}
                                alt="Memory"
                                style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "2px" }}
                              />
                              <div
                                style={{
                                  fontFamily: "'Caveat', cursive",
                                  fontSize: "0.9375rem",
                                  marginTop: "6px",
                                  color: "#1e293b",
                                  lineHeight: 1.2,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {post.message || "Class Memory"}
                              </div>
                            </div>
                          );
                        })}
                        {posts.length === 0 && (
                          <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                            No memory photos published yet. Publish from Yearbook Spread!
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="page-folio-footer">
                      <span>Candid Archive</span>
                      <span>Page iv</span>
                    </div>
                  </div>
                </>
              )}

              {/* SPREAD 3: HONORS & SUPERLATIVES */}
              {currentSpread === 2 && (
                <>
                  {/* Left Page: Superlative Medallions */}
                  <div className="book-page-half left-page">
                    <div>
                      <div className="page-folio-header">
                        <span className="chapter-roman-numeral">Liber III</span>
                        <span className="chapter-running-head">Senior Superlatives</span>
                      </div>

                      <div className="holographic-foil-medal" style={{ marginBottom: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Trophy size={24} />
                          <div>
                            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                              Cohort Laureates
                            </h4>
                            <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                              Recognizing exceptional classmate contributions
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {["Most Likely to Be CEO", "Class Visionary", "Creative Maverick"].map((cat) => (
                          <div
                            key={cat}
                            style={{
                              padding: "10px 14px",
                              background: "#fef3c7",
                              border: "1px solid #fde68a",
                              borderRadius: "6px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#78350f" }}>
                              {cat}
                            </span>
                            <Sparkles size={14} color="#b45309" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="page-folio-footer">
                      <span>Senior Superlatives</span>
                      <span>Page v</span>
                    </div>
                  </div>

                  {/* Right Page: Superlatives Launch Action */}
                  <div className="book-page-half right-page">
                    <div style={{ textAlign: "center", margin: "auto 0" }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          background: "#fef3c7",
                          color: "#b45309",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 16,
                        }}
                      >
                        <Trophy size={28} />
                      </div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#1e293b", marginBottom: 6 }}>
                        Live Synchronized Voting
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: 20, maxWidth: 300, margin: "0 auto 20px" }}>
                        Cast your ballots live for senior honors and see real-time vote tallies across the graduating cohort.
                      </p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={onOpenSuperlatives}
                      >
                        <span>Open Superlative Ballot</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    <div className="page-folio-footer">
                      <span>Honor Roll</span>
                      <span>Page vi</span>
                    </div>
                  </div>
                </>
              )}

              {/* SPREAD 4: AUTOGRAPHS & MARGINS */}
              {currentSpread === 3 && (
                <>
                  {/* Left Page: Autograph Parchment */}
                  <div className="book-page-half left-page">
                    <div>
                      <div className="page-folio-header">
                        <span className="chapter-roman-numeral">Liber IV</span>
                        <span className="chapter-running-head">Autograph Margins</span>
                      </div>

                      <div
                        style={{
                          background: "#fdf0ec",
                          padding: "16px",
                          borderRadius: "6px",
                          border: "1px dashed #f43f5e",
                          fontFamily: "'Caveat', cursive",
                          fontSize: "1.35rem",
                          lineHeight: 1.3,
                          color: "#881337",
                          marginBottom: 16,
                          transform: "rotate(-1deg)",
                        }}
                      >
                        "Best of luck in medical school Alex! Thank you for carrying our senior design project! – Jordan"
                      </div>

                      <div
                        style={{
                          background: "#fcf6e8",
                          padding: "16px",
                          borderRadius: "6px",
                          border: "1px dashed #d97706",
                          fontFamily: "'Caveat', cursive",
                          fontSize: "1.35rem",
                          lineHeight: 1.3,
                          color: "#422006",
                          transform: "rotate(1.5deg)",
                        }}
                      >
                        "Keep building great things! Let's definitely meet up when you move to San Francisco! 🚀 – Sarah"
                      </div>
                    </div>

                    <div className="page-folio-footer">
                      <span>Peer Dedications</span>
                      <span>Page vii</span>
                    </div>
                  </div>

                  {/* Right Page: Sign Book Trigger */}
                  <div className="book-page-half right-page">
                    <div style={{ textAlign: "center", margin: "auto 0" }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          background: "#fef3c7",
                          color: "#b45309",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 16,
                        }}
                      >
                        <PenTool size={28} />
                      </div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#1e293b", marginBottom: 6 }}>
                        Sign Classmate Yearbooks
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: 20, maxWidth: 300, margin: "0 auto 20px" }}>
                        Pin personalized polaroids, stamps, and handwritten cursive notes to your peers' personal yearbook walls.
                      </p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={onOpenAutographs}
                      >
                        <span>Open Autograph Walls</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    <div className="page-folio-footer">
                      <span>Handwritten Margins</span>
                      <span>Page viii</span>
                    </div>
                  </div>
                </>
              )}

              {/* SPREAD 5: RELOCATION ATLAS & 2031 REUNION VAULT */}
              {currentSpread === 4 && (
                <>
                  {/* Left Page: Relocation Map Atlas */}
                  <div className="book-page-half left-page">
                    <div>
                      <div className="page-folio-header">
                        <span className="chapter-roman-numeral">Liber V</span>
                        <span className="chapter-running-head">Alumni Horizons</span>
                      </div>

                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", color: "#1e293b", marginBottom: 12 }}>
                        Where We Are Moving
                      </h3>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                        {["New York", "San Francisco", "Seattle", "Austin", "London", "Boston"].map((city) => (
                          <div
                            key={city}
                            style={{
                              padding: "6px 12px",
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              borderRadius: "9999px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#334155",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <MapPin size={11} color="#b45309" />
                            <span>{city}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ width: "100%" }}
                        onClick={onOpenAlumni}
                      >
                        <span>Explore Full Alumni Atlas</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="page-folio-footer">
                      <span>Post-Graduation Horizons</span>
                      <span>Page ix</span>
                    </div>
                  </div>

                  {/* Right Page: 2031 Time Capsule Vault */}
                  <div className="book-page-half right-page">
                    <div>
                      <div className="page-folio-header">
                        <span className="chapter-roman-numeral">Epilogue</span>
                        <span className="chapter-running-head">5-Year Reunion Vault</span>
                      </div>

                      <div
                        style={{
                          background: "#fef3c7",
                          border: "2px double #b45309",
                          borderRadius: "8px",
                          padding: "16px",
                          textAlign: "center",
                          marginBottom: 16,
                        }}
                      >
                        <Lock size={24} color="#78350f" style={{ margin: "0 auto 8px" }} />
                        <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "#78350f", margin: 0 }}>
                          Cryptographic Reunion Seal
                        </h4>
                        <p style={{ fontSize: "0.75rem", color: "#92400e", marginTop: 4 }}>
                          Senior predictions sealed until May 30, {parseInt(gradYear, 10) + 5}.
                        </p>
                      </div>

                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: "100%" }}
                        onClick={onOpenTimeCapsule}
                      >
                        <span>View Sealed Predictions</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    <div className="page-folio-footer">
                      <span>Finis · Class of {gradYear}</span>
                      <span>Page x</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Spread Navigation Chapter Pills */}
      <div className="spread-navigation-bar">
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentSpread === 0}
          onClick={goToPrevSpread}
        >
          <ChevronLeft size={16} />
          <span>Previous Chapter</span>
        </button>

        <div className="spread-chapter-pills">
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              className={`spread-chapter-btn ${currentSpread === ch.id ? "active" : ""}`}
              onClick={() => {
                playPageTurnSound();
                setFlipDirection(ch.id > currentSpread ? 1 : -1);
                setCurrentSpread(ch.id);
              }}
            >
              <span>{ch.title}</span>
            </button>
          ))}
        </div>

        <button
          className="btn btn-secondary btn-sm"
          disabled={currentSpread === CHAPTERS.length - 1}
          onClick={goToNextSpread}
        >
          <span>Next Chapter</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
