import React, { useState } from "react";
import html2pdf from "html2pdf.js";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_GRADUATION_MEMORIES } from "../data/defaultMemories";
import { Download, Loader2, BookOpen, GraduationCap, Trophy, Sparkles } from "lucide-react";
import "./gallery-export.css";
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

export default function GalleryExport({ roomId }) {
  const [isExporting, setIsExporting] = useState(false);
  const [bookData, setBookData] = useState(null);

  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      // 1. Fetch Room Data
      const roomSnap = await getDoc(doc(db, "rooms", roomId));
      const room = roomSnap.data() || {
        university: "Stanford University",
        department: "Computer Science & Engineering",
        gradYear: "2026",
      };

      // 2. Fetch Members
      const memberCol = collection(db, "rooms", roomId, "members");
      const memberSnap = await getDocs(memberCol);
      const loadedMembers = await Promise.all(
        memberSnap.docs.slice(0, 10).map(async (memDoc) => {
          const userSnap = await getDoc(doc(db, "users", memDoc.id));
          const uData = userSnap.data() || {};
          return {
            uid: memDoc.id,
            displayName: uData.displayName || "Classmate",
            nextChapter: uData.nextChapter || "Engineering & Innovation",
            city: uData.city || "San Francisco Bay Area",
          };
        })
      );

      // 3. Fetch Posts or fallback to authentic graduation memories
      const postsCol = collection(db, "rooms", roomId, "posts");
      const postsSnap = await getDocs(postsCol);
      let loadedPosts = postsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (loadedPosts.length === 0) {
        loadedPosts = DEFAULT_GRADUATION_MEMORIES;
      }

      setBookData({
        room,
        members: loadedMembers.length > 0 ? loadedMembers : [
          { uid: "m1", displayName: "Sophia Martinez", nextChapter: "Software Engineer @ Stripe", city: "Seattle, WA" },
          { uid: "m2", displayName: "David Chen", nextChapter: "Robotics Researcher @ MIT", city: "Boston, MA" },
          { uid: "m3", displayName: "Elena Rostova", nextChapter: "Venture Capital Analyst", city: "New York, NY" },
          { uid: "m4", displayName: "Marcus Vance", nextChapter: "Autonomous Systems Lead", city: "San Francisco, CA" },
        ],
        posts: loadedPosts.slice(0, 4),
      });

      // Wait for DOM state to update
      await new Promise((r) => setTimeout(r, 600));

      const element = document.getElementById("hardbound-yearbook-pdf-buffer");
      if (!element) throw new Error("Print buffer not found");

      const opt = {
        margin: 0,
        filename: `${room.university.replace(/\s+/g, "_")}_Class_of_${room.gradYear || "2026"}_Yearbook.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("PDF generation failed: " + err.message);
    } finally {
      setIsExporting(false);
      setBookData(null);
    }
  };

  const university = bookData?.room?.university || "University";
  const department = bookData?.room?.department || "Academic Department";
  const gradYear = bookData?.room?.gradYear || "2026";
  const romanEdition = toRomanYear(gradYear);

  return (
    <>
      <button
        onClick={handleExportPDF}
        disabled={isExporting}
        className="btn btn-secondary btn-sm"
        style={{ gap: 6 }}
        title="Export Yearbook PDF"
      >
        {isExporting ? <Loader2 size={14} className="spin-slow" /> : <BookOpen size={14} />}
        <span>{isExporting ? "Generating PDF..." : "Export Yearbook PDF"}</span>
      </button>

      {/* Hidden Offscreen Multi-Page Book Print Buffer */}
      {bookData && (
        <div id="hardbound-yearbook-pdf-buffer" className="pdf-render-buffer">
          {/* ================= PAGE 1: HARDCOVER LEATHER FOIL COVER ================= */}
          <div className="pdf-book-page pdf-hardcover-front">
            <div className="pdf-cover-foil-border" />

            <div style={{ marginTop: 80 }}>
              <div className="pdf-cover-crest-emblem">
                {getCohortLogo(bookData) ? (
                  <img
                    src={getCohortLogo(bookData)}
                    alt={university}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : (
                  university[0]?.toUpperCase() || "U"
                )}
              </div>
              <h1 className="pdf-cover-title">{university}</h1>
              <p className="pdf-cover-subtitle">{department}</p>
            </div>

            <div style={{ marginBottom: 60 }}>
              <div className="pdf-cover-edition">
                COMMEMORATIVE YEARBOOK · VOLUME {romanEdition}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: 14, letterSpacing: "0.1em" }}>
                OFFICIAL COMMENCEMENT ARCHIVE · CLASS OF {gradYear}
              </div>
            </div>
          </div>

          {/* ================= PAGE 2: PROCLAMATION & CLASSMATE DIRECTORY ================= */}
          <div className="pdf-book-page pdf-inner-page">
            <div>
              <div className="pdf-page-running-head">
                <span>Liber I · The Classmate Register</span>
                <span>{university}</span>
              </div>

              <div style={{ margin: "24px 0 16px", textAlign: "center" }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.6rem", color: "#1e293b", margin: 0 }}>
                  Commencement Proclamation
                </h2>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "0.9375rem", color: "#78350f", marginTop: 6 }}>
                  "To the scholars, visionaries, and companions of our graduating class."
                </p>
              </div>

              <div
                style={{
                  borderLeft: "2px solid #d97706",
                  paddingLeft: "16px",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "0.875rem",
                  lineHeight: "1.6",
                  color: "#334155",
                  fontStyle: "italic",
                  marginBottom: 24,
                }}
              >
                "Let this volume stand as an immortal testament to the journey we shared. We entered these halls as ambitious strangers and depart as colleagues shaping the frontier of tomorrow."
              </div>

              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: "#1e293b", marginBottom: 12 }}>
                Graduating Laureates
              </h3>

              <div className="pdf-roster-grid">
                {bookData.members.map((m) => {
                  const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
                    m.displayName
                  )}&backgroundColor=fef3c7`;

                  return (
                    <div key={m.uid} className="pdf-roster-member">
                      <img src={avatarUrl} alt={m.displayName} className="pdf-roster-avatar" />
                      <div>
                        <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a" }}>
                          {m.displayName}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#78350f", fontWeight: 600 }}>
                          {m.nextChapter}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                          {m.city}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pdf-page-running-foot">
              <span>{department}</span>
              <span>Folio ii</span>
            </div>
          </div>

          {/* ================= PAGE 3: POLAROID MEMORY SPREAD ================= */}
          <div className="pdf-book-page pdf-inner-page">
            <div>
              <div className="pdf-page-running-head">
                <span>Liber II · Memory Chronicles</span>
                <span>Class of {gradYear}</span>
              </div>

              <div style={{ margin: "20px 0 10px" }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "#1e293b", margin: 0 }}>
                  Candid Campus Moments
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: 4 }}>
                  Surviving 8:00 AM lectures, late-night capstone breakthroughs, and quad lawn celebrations.
                </p>
              </div>

              <div className="pdf-polaroids-grid">
                {bookData.posts.map((post) => (
                  <div key={post.id} className="pdf-polaroid-item">
                    <img
                      src={post.imageUrls?.[0]}
                      alt="Graduation Memory"
                      className="pdf-polaroid-photo"
                    />
                    <div className="pdf-polaroid-caption">
                      "{post.message}"
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 8,
                        fontSize: "0.75rem",
                        color: "#64748b",
                        borderTop: "1px dashed rgba(0,0,0,0.15)",
                        paddingTop: 6,
                      }}
                    >
                      <span>– {post.authorName}</span>
                      <span style={{ fontFamily: "'Courier New', monospace", color: "#b91c1c", fontWeight: 700 }}>
                        [{post.stamp || "CORE MEMORY"}]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pdf-page-running-foot">
              <span>Commemorative Archive</span>
              <span>Folio iii</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
