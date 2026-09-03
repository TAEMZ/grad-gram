import React, { useState, useRef, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Play,
  Pause,
  Upload,
  Volume2,
  VolumeX,
  Disc3,
  Music2,
  Loader2,
  Check,
} from "lucide-react";

export default function ClassAnthem({
  roomId,
  anthemUrl,
  anthemTitle,
  isCreator,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const displayTitle = anthemTitle || "No Class Anthem Uploaded Yet";

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [anthemUrl]);

  // Pause audio if URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [anthemUrl]);

  const togglePlay = () => {
    if (!anthemUrl || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Playback error:", err));
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "gradgram_preset");

      // Cloudinary auto/upload handles audio/video and mp3s
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/du1b6818e/auto/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      const uploadedUrl = data.secure_url;

      if (!uploadedUrl) {
        throw new Error(data.error?.message || "Audio upload failed");
      }

      // Strip extension for clean title
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

      // Update room document in Firestore
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        anthemUrl: uploadedUrl,
        anthemTitle: cleanTitle,
      });

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      alert("Failed to upload audio: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        background: "rgba(16, 21, 33, 0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(229, 184, 105, 0.2)",
        borderRadius: "var(--radius-lg)",
        padding: "12px 14px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
        position: "relative",
      }}
    >
      {/* Hidden Native Audio Element */}
      {anthemUrl && <audio ref={audioRef} src={anthemUrl} preload="metadata" />}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg"
        style={{ display: "none" }}
        onChange={handleAudioUpload}
      />

      {/* Top Header: Vinyl Icon & Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: isPlaying
                ? "linear-gradient(135deg, #e5b869, #b8863b)"
                : "rgba(255, 255, 255, 0.05)",
              color: isPlaying ? "#080a0f" : "var(--gold-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Disc3 size={15} className={isPlaying ? "spin-slow" : ""} />
          </div>

          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.2,
              }}
              title={displayTitle}
            >
              {displayTitle}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {anthemUrl ? "Official Class Anthem" : "No song selected"}
            </div>
          </div>
        </div>

        {/* Upload Button */}
        {(isCreator || !anthemUrl) && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-ghost btn-sm"
            style={{
              padding: "4px 8px",
              fontSize: "0.6875rem",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              gap: "4px",
              color: uploadSuccess ? "#4ade80" : "var(--gold-light)",
            }}
            title="Upload audio file (.mp3, .wav)"
          >
            {isUploading ? (
              <Loader2 size={12} className="spin-slow" />
            ) : uploadSuccess ? (
              <Check size={12} />
            ) : (
              <Upload size={12} />
            )}
            <span>{isUploading ? "Uploading..." : uploadSuccess ? "Uploaded" : "Change"}</span>
          </button>
        )}
      </div>

      {/* Playback Controls & Scrubber */}
      {anthemUrl ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={togglePlay}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--gold-primary)",
                color: "#080a0f",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(229, 184, 105, 0.3)",
              }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} style={{ marginLeft: 2 }} />}
            </button>

            {/* Scrubber Range Bar */}
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent || 0}
              onChange={handleSeek}
              style={{
                flex: 1,
                accentColor: "var(--gold-primary)",
                cursor: "pointer",
                height: "4px",
              }}
            />

            {/* Timestamp */}
            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--slate-400)",
                fontFamily: "monospace",
                minWidth: "32px",
                textAlign: "right",
              }}
            >
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "8px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px dashed rgba(229, 184, 105, 0.3)",
            color: "var(--gold-light)",
            fontSize: "0.75rem",
            cursor: "pointer",
            marginTop: "4px",
          }}
        >
          {isUploading ? <Loader2 size={13} className="spin-slow" /> : <Music2 size={13} />}
          <span>{isUploading ? "Uploading Anthem Audio..." : "+ Upload Class Song (.mp3)"}</span>
        </button>
      )}
    </div>
  );
}
