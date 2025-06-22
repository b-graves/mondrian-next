"use client";

import React, { useState } from "react";
import Link from "next/link";
import Canvas from "../Canvas/Canvas";
import Painting from "../../types/Painting";
import SavedPainting, { Details } from "../../types/SavedPainting";
import { savePainting } from "../../services/s3Service";
import "./Studio.css";
import { usePaintings } from "../../contexts/PaintingsContext";
import { useRouter } from "next/navigation";

const Studio: React.FC = () => {
  const router = useRouter();
  const { prependPainting } = usePaintings();
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

  const [isSaving, setIsSaving] = useState(false);

  const updatePainting = (updatedPainting: Painting) => {
    setPainting(updatedPainting);
  };

  const clear = () => {
    setPainting({
      canvas: {
        ...painting.canvas,
      },
      rootSection: {
        color: "white",
        isSplit: false,
        id: new Date().getTime().toString(),
      },
    });
    setDetails({
      ...details,
      artist: "",
      title: "",
      date: new Date().getTime(),
    });
  };

  const save = async () => {
    setIsSaving(true);
    const paintingToSave: SavedPainting = {
      painting,
      details: {
        ...details,
        artist: details.artist || "Anonymous",
        title: details.title || "Untitled",
      },
    };
    try {
      const { number } = await savePainting(paintingToSave);
      const finalPainting = { ...paintingToSave, number };
      prependPainting(finalPainting);
      router.push("/gallery");
    } catch (error) {
      console.error("Error saving painting:", error);
      alert("Failed to save your painting. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="studio-container-fullscreen">
      <main className="studio-main-content">
        <div className="studio-top-bar">
          <div className="canvas-controls">
            <span>Canvas</span>
            <div className="shape-selectors">
              <button
                aria-label="Square Canvas"
                className={`shape-button square ${
                  painting.canvas.shape === "square" ? "active" : ""
                }`}
                onClick={() =>
                  setPainting({ ...painting, canvas: { shape: "square" } })
                }
                disabled={isSaving}
              />
              <button
                aria-label="Landscape Canvas"
                className={`shape-button landscape ${
                  painting.canvas.shape === "landscape" ? "active" : ""
                }`}
                onClick={() =>
                  setPainting({ ...painting, canvas: { shape: "landscape" } })
                }
                disabled={isSaving}
              />
              <button
                aria-label="Portrait Canvas"
                className={`shape-button portrait ${
                  painting.canvas.shape === "portrait" ? "active" : ""
                }`}
                onClick={() =>
                  setPainting({ ...painting, canvas: { shape: "portrait" } })
                }
                disabled={isSaving}
              />
            </div>
          </div>
          <button
            onClick={clear}
            className="new-canvas-link"
            disabled={isSaving}
          >
            New Canvas
          </button>
        </div>

        <div className="studio-canvas-container">
          <Canvas painting={painting} paint={updatePainting} />
        </div>

        <div className="studio-label-area">
          <form
            id="details-form"
            className="details-form-main"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="input-group">
              <input
                type="text"
                placeholder="Anonymous"
                value={details.artist}
                onChange={(e) =>
                  setDetails({ ...details, artist: e.target.value })
                }
                autoComplete="off"
                disabled={isSaving}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Untitled"
                value={details.title}
                onChange={(e) =>
                  setDetails({ ...details, title: e.target.value })
                }
                autoComplete="off"
                disabled={isSaving}
                style={{ fontStyle: "italic" }}
              />
            </div>
            <button type="submit" className="save-button" disabled={isSaving}>
              {isSaving ? "Saving..." : "Hang in the gallery"}
            </button>
          </form>
        </div>
      </main>

      <Link href="/gallery" className="go-to-gallery-link">
        <span>Go to gallery ↑</span>
      </Link>
    </div>
  );
};

export default Studio;
