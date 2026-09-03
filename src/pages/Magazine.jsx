import React, { useState } from "react";
import PostList from "./PostList";
import GalleryExport from "../components/GalleryExport";
import DarkroomComposer from "../components/DarkroomComposer";
import { Camera, Plus, Sparkles } from "lucide-react";
import "./magazine.css";

function Magazine({ roomId, isCreator }) {
  const [isDarkroomOpen, setIsDarkroomOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setIsDarkroomOpen(true);
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setIsDarkroomOpen(true);
  };

  const handleCloseComposer = () => {
    setIsDarkroomOpen(false);
    setEditingPost(null);
  };

  return (
    <div className="magazine-wrapper animate-fade-in">
      {/* Darkroom Photo Development Chamber Modal (Create or Edit Mode) */}
      <DarkroomComposer
        isOpen={isDarkroomOpen}
        onClose={handleCloseComposer}
        roomId={roomId}
        editPost={editingPost}
      />

      {/* Top Editorial Action Header */}
      <div className="magazine-header-actions">
        <div className="magazine-header-titles">
          <h2>Yearbook Polaroid Gallery 🎞️</h2>
          <p>
            Candid moments, campus milestones, and double-sided physical Polaroids. Click any photo to flip and read the story.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <GalleryExport roomId={roomId} />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreate}
          >
            <Camera size={15} />
            <span>Develop New Polaroid</span>
          </button>
        </div>
      </div>

      {/* 3D Double-Sided Polaroid Wall */}
      <PostList roomId={roomId} onEditPost={handleOpenEdit} />
    </div>
  );
}

export default Magazine;
