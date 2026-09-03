import React from "react";

/**
 * GradGram Official Bespoke Brandmark
 * Combines an architectural graduation mortarboard cap top with an interlocking gold 'G' monogram,
 * gold-thread tassel, and double-ring commencement medallion geometry.
 */
export function GradGramMark({ size = 44, className = "" }) {
  const uid = React.useId().replace(/:/g, "");
  const goldGradId = `ggGold_${uid}`;
  const goldLightId = `ggLight_${uid}`;
  const darkGradId = `ggDark_${uid}`;
  const glowId = `ggGlow_${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
      role="img"
      aria-label="GradGram Emblem"
    >
      <defs>
        {/* Deep Metallic Gold Gradient */}
        <linearGradient id={goldGradId} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="25%" stopColor="#fef08a" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="85%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Highlight Gradient for Upper Facet */}
        <linearGradient id={goldLightId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Deep Obsidian Background for Medallion */}
        <radialGradient id={darkGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="70%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#030712" />
        </radialGradient>

        {/* Ambient Bloom Filter */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Outer Circular Medallion Shield Base */}
      <circle cx="50" cy="50" r="47" fill={`url(#${darkGradId})`} stroke={`url(#${goldGradId})`} strokeWidth="2.5" />
      <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#${goldGradId})`} strokeWidth="0.8" strokeOpacity="0.45" strokeDasharray="3 2" />

      {/* Interlocking Monogram 'G' Body */}
      <path
        d="M 50 82 
           C 31 82 20 69 20 50 
           C 20 37 27 28 38 23 
           L 41 28
           C 32 32 26 40 26 50 
           C 26 65 35 76 50 76 
           C 62 76 71 69 73 57
           L 52 57
           L 52 51
           L 79 51
           C 78 69 66 82 50 82 Z"
        fill={`url(#${goldGradId})`}
        filter={`url(#${glowId})`}
      />

      {/* The Architectural Graduation Mortarboard Diamond Top Plate */}
      <g filter={`url(#${glowId})`}>
        {/* Main Diamond Rhombus */}
        <path
          d="M 50 17 L 84 31 L 50 45 L 16 31 Z"
          fill={`url(#${goldLightId})`}
        />

        {/* 3D Bevel Facet - Left Darker Shade */}
        <path
          d="M 16 31 L 50 45 L 50 48 L 16 34 Z"
          fill="#92400e"
        />

        {/* 3D Bevel Facet - Right Lighter Shade */}
        <path
          d="M 84 31 L 50 45 L 50 48 L 84 34 Z"
          fill="#b45309"
        />

        {/* Under-Cap Skullcap Base */}
        <path
          d="M 33 38 C 33 46 67 46 67 38 L 64 43 C 64 48 36 48 36 43 Z"
          fill="#78350f"
        />

        {/* Center Button Pivot Stud */}
        <circle cx="50" cy="31" r="3.2" fill="#fffbeb" stroke="#78350f" strokeWidth="1" />

        {/* Cascading Commencement Silk Tassel */}
        {/* Tassel cord arching from center stud to left corner */}
        <path
          d="M 50 31 Q 30 31 22 36 Q 18 42 21 54"
          fill="none"
          stroke={`url(#${goldGradId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Tassel decorative ring & ribbon fringe */}
        <circle cx="21" cy="54" r="2.2" fill="#fef08a" stroke="#78350f" strokeWidth="0.8" />
        <path
          d="M 18.5 56 L 23.5 56 L 25 70 L 21 68 L 17 70 Z"
          fill={`url(#${goldLightId})`}
        />
      </g>
    </svg>
  );
}

/**
 * Complete Brand Component with typography wordmark
 */
export default function GradGramLogo({
  size = 40,
  variant = "full",
  subtitle = "",
  className = "",
}) {
  if (variant === "mark") {
    return <GradGramMark size={size} className={className} />;
  }

  return (
    <div
      className={`gradgram-brand-lockup ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <GradGramMark size={size} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: size >= 40 ? "1.35rem" : "1.15rem",
            fontWeight: 800,
            letterSpacing: "0.12em",
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #ffffff 0%, #fef08a 55%, #d97706 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          GRADGRAM
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--gold-primary, #fbbf24)",
              marginTop: 2,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
