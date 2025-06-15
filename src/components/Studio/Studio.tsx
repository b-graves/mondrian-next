"use client";

import React, { useState } from "react";
import Canvas from "../Canvas/Canvas";
import { Form, Button, ButtonGroup } from "react-bootstrap";
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
      <div style={{ marginBottom: 24 }}>
        <ButtonGroup>
          <Button
            variant={
              painting.canvas.shape === "square" ? "primary" : "outline-primary"
            }
            onClick={() =>
              setPainting({ ...painting, canvas: { shape: "square" } })
            }
          >
            Square
          </Button>
          <Button
            variant={
              painting.canvas.shape === "landscape"
                ? "primary"
                : "outline-primary"
            }
            onClick={() =>
              setPainting({ ...painting, canvas: { shape: "landscape" } })
            }
          >
            Landscape
          </Button>
          <Button
            variant={
              painting.canvas.shape === "portrait"
                ? "primary"
                : "outline-primary"
            }
            onClick={() =>
              setPainting({ ...painting, canvas: { shape: "portrait" } })
            }
          >
            Portrait
          </Button>
        </ButtonGroup>
        <Button variant="secondary" style={{ marginLeft: 16 }} onClick={clear}>
          New Canvas
        </Button>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Canvas painting={painting} paint={updatePainting} />
      </div>
      <Form style={{ maxWidth: 400, margin: "0 auto" }}>
        <Form.Group>
          <Form.Label>Artist</Form.Label>
          <Form.Control
            type="text"
            placeholder="Anonymous"
            value={details.artist}
            onChange={(e) => setDetails({ ...details, artist: e.target.value })}
            autoComplete="off"
          />
        </Form.Group>
        <Form.Group style={{ marginTop: 12 }}>
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Untitled"
            value={details.title}
            onChange={(e) => setDetails({ ...details, title: e.target.value })}
            autoComplete="off"
          />
        </Form.Group>
        <Button style={{ marginTop: 20 }} onClick={save} variant="success">
          Save to Gallery
        </Button>
      </Form>
    </div>
  );
};

export default Studio;
