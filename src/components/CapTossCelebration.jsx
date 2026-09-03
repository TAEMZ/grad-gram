import React, { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { db } from "../firebase";
import { GraduationCap, Sparkles, Trophy, Award, PartyPopper } from "lucide-react";
import "./captoss.css";

// Web Audio API synthesized fanfare chords (no external asset dependency)
const playFanfare = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + 1.3);
    });
  } catch (e) {
    console.log("Audio not supported or permitted");
  }
};

export default function CapTossCelebration({ roomId, universityName, gradYear = "2026" }) {
  const [communalCount, setCommunalCount] = useState(0);
  const [caps, setCaps] = useState([]);
  const [myTossCount, setMyTossCount] = useState(0);

  // 1. Subscribe to live communal toss count
  useEffect(() => {
    if (!roomId) return;
    const statsRef = doc(db, "rooms", roomId, "ceremony", "stats");
    const unsubscribe = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) {
        setCommunalCount(snap.data().totalTosses || 0);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  const handleToss = async () => {
    playFanfare();
    setMyTossCount((prev) => prev + 1);

    // 1. Spawn flying cap entities with random velocities
    const newCaps = Array.from({ length: 4 }).map(() => ({
      id: Math.random().toString(36),
      x: (Math.random() - 0.5) * 300,
      targetY: -(300 + Math.random() * 250),
      rotate: (Math.random() - 0.5) * 720,
      scale: 0.8 + Math.random() * 0.6,
    }));

    setCaps((prev) => [...prev.slice(-12), ...newCaps]);

    // 2. Confetti cannon bursts
    confetti({
      particleCount: 60,
      spread: 100,
      origin: { y: 0.7 },
      colors: ["#e5b869", "#f3d498", "#b8863b", "#ffffff", "#38bdf8"],
    });

    // 3. Atomically increment communal tally in Firestore
    try {
      const statsRef = doc(db, "rooms", roomId, "ceremony", "stats");
      await setDoc(statsRef, { totalTosses: increment(1) }, { merge: true });
    } catch (err) {
      console.error("Error updating ceremony count:", err);
    }
  };

  return (
    <div className="captoss-stage-card animate-fade-in">
      {/* Floating Animated Caps */}
      <AnimatePresence>
        {caps.map((cap) => (
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
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="flying-cap-entity"
          >
            <svg width="60" height="45" viewBox="0 0 100 80">
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

      <div className="captoss-titles">
        <h2>Commencement Cap Toss Ceremony</h2>
        <p>
          Celebrate your graduation milestone with your entire class. Tap to launch your cap into the air and trigger the communal cascade!
        </p>
      </div>

      <div className="communal-counter-pill">
        <Sparkles size={16} />
        <span>{communalCount} Total Cohort Caps Tossed</span>
      </div>

      <button className="toss-launch-button" onClick={handleToss}>
        <GraduationCap size={28} />
        <span>Toss Your Cap 🎓</span>
      </button>

      {myTossCount > 0 && (
        <div style={{ marginTop: 24, fontSize: "0.875rem", color: "var(--slate-300)" }}>
          You have tossed <strong>{myTossCount}</strong> times for the Class of {gradYear}! 🎉
        </div>
      )}
    </div>
  );
}
