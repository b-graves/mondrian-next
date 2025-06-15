"use client";

import React, { useState } from "react";
import Canvas from "../Canvas/Canvas";
import Painting from "../../types/Painting";
import SavedPainting, { Details } from "../../types/SavedPainting";
import { savePainting } from "../../services/s3Service";

interface StudioProps {
  setUserPainting: (userPainting: SavedPainting) => void;
}

const Studio: React.FC<StudioProps> = ({ setUserPainting }) => {
  const [painting, setPainting] = useState<Painting>({
    canvas: {
      shape: "square",
    },
    rootSection: {
      color: "white",
      isSplit: false,
      id: new Date().getTime().toString(),
    },
  });

  const [details, setDetails] = useState<Details>({
    artist: "",
    title: "",
    year: new Date().getFullYear(),
    date: new Date().getTime(),
  });

  const updatePainting = (updatedPainting: Painting) => {
    setPainting(updatedPainting);
  };

  const clear = () => {
    setPainting({
      canvas: {
        shape: painting.canvas.shape,
      },
      rootSection: {
        color: "white",
        isSplit: false,
        id: new Date().getTime().toString(),
      },
    });
    setDetails({
      ...details,
      title: "",
      date: new Date().getTime(),
    });
  };

  const save = async () => {
    const paintingToSave: SavedPainting = {
      painting,
      details: {
        ...details,
        artist: details.artist || "Anonymous",
        title: details.title || "Untitled",
      },
    };
    try {
      await savePainting(paintingToSave);
      setUserPainting(paintingToSave);
    } catch (error) {
      console.error("Error saving painting:", error);
      alert("Failed to save your painting. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: 24 }}>
      <div style={{ marginBottom: 24, display: "flex", gap: 8 }}>
        <button
          style={{
            padding: "8px 16px",
            background: painting.canvas.shape === "square" ? "#222" : "#eee",
            color: painting.canvas.shape === "square" ? "#fff" : "#222",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
          }}
          onClick={() =>
            setPainting({ ...painting, canvas: { shape: "square" } })
          }
        >
          Square
        </button>
        <button
          style={{
            padding: "8px 16px",
            background: painting.canvas.shape === "landscape" ? "#222" : "#eee",
            color: painting.canvas.shape === "landscape" ? "#fff" : "#222",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
          }}
          onClick={() =>
            setPainting({ ...painting, canvas: { shape: "landscape" } })
          }
        >
          Landscape
        </button>
        <button
          style={{
            padding: "8px 16px",
            background: painting.canvas.shape === "portrait" ? "#222" : "#eee",
            color: painting.canvas.shape === "portrait" ? "#fff" : "#222",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
          }}
          onClick={() =>
            setPainting({ ...painting, canvas: { shape: "portrait" } })
          }
        >
          Portrait
        </button>
        <button
          style={{
            marginLeft: 16,
            padding: "8px 16px",
            background: "#eee",
            color: "#222",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
          }}
          onClick={clear}
        >
          New Canvas
        </button>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Canvas painting={painting} paint={updatePainting} />
      </div>
      <form
        style={{
          maxWidth: 400,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label style={{ fontWeight: 500 }}>Artist</label>
        <input
          type="text"
          placeholder="Anonymous"
          value={details.artist}
          onChange={(e) => setDetails({ ...details, artist: e.target.value })}
          autoComplete="off"
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <label style={{ fontWeight: 500 }}>Title</label>
        <input
          type="text"
          placeholder="Untitled"
          value={details.title}
          onChange={(e) => setDetails({ ...details, title: e.target.value })}
          autoComplete="off"
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            marginTop: 20,
            padding: "10px 0",
            background: "#1aaf5d",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Save to Gallery
        </button>
      </form>
    </div>
  );
};

export default Studio;
