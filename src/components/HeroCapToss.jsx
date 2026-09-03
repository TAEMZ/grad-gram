import React, { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { db } from "../firebase";
import { Sparkles, Trophy } from "lucide-react";
import "./hero-captoss.css";

// Web Audio API celebratory fanfare
const playFanfare = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + idx * 0.07 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.07);
      osc.stop(ctx.currentTime + 1.2);
    });
  } catch (e) {}
};

export default function HeroCapToss() {
  const [communalTosses, setCommunalTosses] = useState(142);
  const [flyingCaps, setFlyingCaps] = useState([]);
  const [myTosses, setMyTosses] = useState(0);

  // Subscribe to global graduation cap toss stats
  useEffect(() => {
    const statsRef = doc(db, "global", "ceremony");
    const unsubscribe = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) {
        setCommunalTosses(snap.data().totalTosses || 142);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToss = async () => {
    playFanfare();
    setMyTosses((prev) => prev + 1);

    // Spawn 4 flying cap entities
    const newCaps = Array.from({ length: 4 }).map(() => ({
      id: Math.random().toString(36),
      x: (Math.random() - 0.5) * 350,
      targetY: -(280 + Math.random() * 260),
      rotate: (Math.random() - 0.5) * 720,
      scale: 0.7 + Math.random() * 0.5,
    }));

    setFlyingCaps((prev) => [...prev.slice(-8), ...newCaps]);

    // Golden confetti cannons
    confetti({
      particleCount: 50,
      spread: 90,
      origin: { y: 0.65 },
      colors: ["#e5b869", "#f3d498", "#b8863b", "#ffffff", "#38bdf8"],
    });

    // Increment global tally in Firestore
    try {
      const statsRef = doc(db, "global", "ceremony");
      await setDoc(statsRef, { totalTosses: increment(1) }, { merge: true });
    } catch (err) {
      // Fallback local increment
      setCommunalTosses((prev) => prev + 1);
    }
  };

  return (
    <div className="hero-captoss-stage animate-fade-in">
      {/* Floating Animated Cap Particles */}
      <AnimatePresence>
        {flyingCaps.map((cap) => (
          <motion.div
            key={cap.id}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0.5 }}
            animate={{
              opacity: [1, 1, 0],
              x: cap.x,
              y: cap.targetY,
              rotate: cap.rotate,
              scale: cap.scale,
            }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="flying-cap-particle"
          >
            <svg width="56" height="42" viewBox="0 0 100 80">
              <path
                d="M50 5 L95 30 L50 55 L5 30 Z"
                fill="#0d111a"
                stroke="#e5b869"
                strokeWidth="4"
              />
              <path
                d="M30 45 L30 65 Q50 78 70 65 L70 45"
                fill="#131824"
                stroke="#e5b869"
                strokeWidth="3"
              />
              <circle cx="50" cy="30" r="4" fill="#e5b869" />
              <path
                d="M50 30 Q70 35 78 50"
                stroke="#f3d498"
                strokeWidth="3"
                fill="none"
              />
              <circle cx="78" cy="52" r="4" fill="#f59e0b" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="hero-captoss-info">
        <h3>Class Commencement Tradition</h3>
        <p>
          Celebrate your graduation milestone. Tap the mortarboard cap to join the collective celebration across all graduating classes.
        </p>

        <div className="hero-captoss-counter-bar">
          <Sparkles size={14} color="var(--gold-primary)" />
          <span>{communalTosses.toLocaleString()} Caps Tossed to the Sky</span>
        </div>
      </div>

      {/* The 3D Mortarboard Cap Button Itself */}
      <div className="interactive-cap-trigger-container">
        <button
          className="interactive-cap-svg-button"
          onClick={handleToss}
          title="Click to toss graduation cap!"
          aria-label="Toss Graduation Cap"
        >
          <svg width="110" height="85" viewBox="0 0 100 80">
            {/* Cap Top Rhombus with realistic shading */}
            <path
              d="M50 8 L95 32 L50 56 L5 32 Z"
              fill="url(#capGradient)"
              stroke="#e5b869"
              strokeWidth="3.5"
            />
            {/* Skullcap / Head Base */}
            <path
              d="M28 46 L28 66 Q50 80 72 66 L72 46"
              fill="#0a0d14"
              stroke="#d4af37"
              strokeWidth="2.5"
            />
            {/* Gold Button Center */}
            <circle cx="50" cy="32" r="4.5" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
            {/* Gold Tassel String */}
            <path
              d="M50 32 Q68 36 78 52"
              stroke="#fef08a"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Tassel Fringe */}
            <circle cx="78" cy="54" r="4.5" fill="#f59e0b" />
            <path d="M76 56 L76 66 M78 56 L78 68 M80 56 L80 66" stroke="#f59e0b" strokeWidth="1.8" />

            <defs>
              <linearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e2738" />
                <stop offset="50%" stopColor="#0f1420" />
                <stop offset="100%" stopColor="#07090e" />
              </linearGradient>
            </defs>
          </svg>
        </button>

        <span className="cap-click-hint">
          {myTosses > 0 ? `Tossed ${myTosses}x 🎉` : "Tap Cap to Toss"}
        </span>
      </div>
    </div>
  );
}
