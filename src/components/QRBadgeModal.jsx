import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { GraduationCap, Printer, X, Copy, Check, QrCode } from "lucide-react";
import { getCohortLogo } from "../utils/cohortLogos";

export default function QRBadgeModal({ isOpen, onClose, roomData }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !roomData) return null;

  const roomUrl = `${window.location.origin}/room/${roomData.roomKey || roomData.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="profile-modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="profile-modal-card"
        style={{ maxWidth: 440, textAlign: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span className="badge-gold">Official Commencement Pass</span>
          <button className="btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Printable Badge Card */}
        <div
          id="printable-commencement-badge"
          style={{
            background: "linear-gradient(180deg, #161c29, #0e121a)",
            border: "2px solid rgba(229, 184, 105, 0.4)",
            borderRadius: "var(--radius-xl)",
            padding: "32px 24px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(229, 184, 105, 0.15)",
              border: "1.5px solid rgba(229, 184, 105, 0.5)",
              color: "var(--gold-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {getCohortLogo(roomData) ? (
              <img
                src={getCohortLogo(roomData)}
                alt={roomData.university}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <GraduationCap size={28} />
            )}
          </div>

          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: "#ffffff", marginBottom: 4 }}>
            {roomData.university}
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--gold-light)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
            {roomData.department} · Class of {roomData.gradYear || "2026"}
          </p>

          {/* QR Code */}
          <div
            style={{
              background: "#ffffff",
              padding: "16px",
              borderRadius: "16px",
              display: "inline-block",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
              marginBottom: 16,
            }}
          >
            <QRCodeSVG
              value={roomUrl}
              size={180}
              level="H"
              fgColor="#080a0f"
              bgColor="#ffffff"
            />
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8 }}>
            Scan with smartphone camera to join yearbook room
          </div>

          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.8125rem",
              background: "rgba(0, 0, 0, 0.4)",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-subtle)",
              color: "var(--slate-300)",
              display: "inline-block",
            }}
          >
            Key: {roomData.roomKey || roomData.id}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
            {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
            <span>{copied ? "Link Copied" : "Copy Direct Link"}</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print Pass Badge</span>
          </button>
        </div>
      </div>
    </div>
  );
}
