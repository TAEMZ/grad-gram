import React, { useState, useEffect, useRef } from "react";
import { doc, setDoc, onSnapshot, increment } from "firebase/firestore";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { db } from "../firebase";
import { Sparkles } from "lucide-react";
import "./floating-cap.css";

// Web Audio API synthesized fanfare chords
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

export default function FloatingCapCeremony() {
  const [communalTosses, setCommunalTosses] = useState(1420);
  const [flyingParticles, setFlyingParticles] = useState([]);
  const [myTossCount, setMyTossCount] = useState(0);

  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D cursor tilt parallax
  const springConfig = { damping: 25, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [18, -18]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-150, 150], [-22, 22]), springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Subscribe to global graduation cap toss stats
  useEffect(() => {
    const statsRef = doc(db, "global", "ceremony");
    const unsubscribe = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) {
        setCommunalTosses(snap.data().totalTosses || 1420);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToss = async () => {
    playFanfare();
    setMyTossCount((prev) => prev + 1);

    // Spawn 5 flying cap particles
    const newCaps = Array.from({ length: 5 }).map(() => ({
      id: Math.random().toString(36),
      x: (Math.random() - 0.5) * 400,
      targetY: -(300 + Math.random() * 280),
      rotate: (Math.random() - 0.5) * 720,
      scale: 0.6 + Math.random() * 0.5,
    }));

    setFlyingParticles((prev) => [...prev.slice(-10), ...newCaps]);

    // Champagne and gold confetti cannons
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.55 },
      colors: ["#e5b869", "#f3d498", "#b8863b", "#ffffff", "#38bdf8"],
    });

    // Increment global tally in Firestore
    try {
      const statsRef = doc(db, "global", "ceremony");
      await setDoc(statsRef, { totalTosses: increment(1) }, { merge: true });
    } catch (err) {
      setCommunalTosses((prev) => prev + 1);
    }
  };

  return (
    <div
      className="floating-cap-stage-unboxed animate-fade-in"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Flying Particle Clouds */}
      <AnimatePresence>
        {flyingParticles.map((cap) => (
          <motion.div
            key={cap.id}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0.4 }}
            animate={{
              opacity: [1, 1, 0],
              x: cap.x,
              y: cap.targetY,
              rotate: cap.rotate,
              scale: cap.scale,
            }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="flying-cap-sky-particle"
          >
            <svg width="60" height="46" viewBox="0 0 100 80">
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

      {/* Unboxed 3D Mortarboard Cap with Cursor Parallax */}
      <motion.div
        className="floating-cap-entity-wrapper"
        style={{ rotateX, rotateY }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleToss}
        title="Click to toss graduation cap!"
      >
        <svg width="150" height="115" viewBox="0 0 100 80">
          {/* Top Cap Rhombus with realistic lighting */}
          <path
            d="M50 6 L96 32 L50 58 L4 32 Z"
            fill="url(#unboxedCapGradient)"
            stroke="#e5b869"
            strokeWidth="3.2"
          />
          {/* Skullcap / Base */}
          <path
            d="M26 46 L26 68 Q50 82 74 68 L74 46"
            fill="#090c12"
            stroke="#d4af37"
            strokeWidth="2.4"
          />
          {/* Gold Button Center */}
          <circle cx="50" cy="32" r="4.5" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
          {/* Golden Tassel String */}
          <path
            d="M50 32 Q70 36 80 54"
            stroke="#fef08a"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Tassel Fringe */}
          <circle cx="80" cy="56" r="4.5" fill="#f59e0b" />
          <path d="M78 58 L78 70 M80 58 L80 72 M82 58 L82 70" stroke="#f59e0b" strokeWidth="2" />

          <defs>
            <linearGradient id="unboxedCapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#253044" />
              <stop offset="45%" stopColor="#101520" />
              <stop offset="100%" stopColor="#06080d" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Floating Clean Counter Below Cap */}
      <div className="floating-cap-clean-counter">
        <div className="floating-cap-number">
          <Sparkles size={16} color="var(--gold-primary)" />
          <span>{communalTosses.toLocaleString()}</span>
        </div>
        <div className="floating-cap-subtext">
          Caps Tossed to the Sky · Click Cap to Toss
        </div>
      </div>
    </div>
  );
}
