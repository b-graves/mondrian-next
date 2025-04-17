'use client';

import React, { useState } from 'react';
import Canvas from '../Canvas/Canvas';
import { Form, Button, ButtonGroup } from 'react-bootstrap';
import { GoPin } from 'react-icons/go';
import Painting from '../../types/Painting';
import SavedPainting, { Details } from '../../types/SavedPainting';
import { savePainting } from '../../services/s3Service';
import './Studio.css';

// Import the image using Next.js Image component
import Image from 'next/image';
import MondrianLeftPortrait from '../../assets/left-portrait.jpg';

interface StudioProps {
  setTab: (tab: number, refresh: boolean) => void;
  setUserPainting: (userPainting: SavedPainting) => void;
}

const Studio: React.FC<StudioProps> = ({ setTab, setUserPainting }) => {
  const [painting, setPainting] = useState<Painting>({
    canvas: {
      shape: "square"
    },
    rootSection: {
      color: "white",
      isSplit: false,
      id: new Date().getTime().toString()
    }
  });

  const [details, setDetails] = useState<Details>({
    artist: "",
    title: "",
    year: new Date().getFullYear(),
    date: new Date().getTime()
  });

  const updatePainting = (updatedPainting: Painting) => {
    setPainting(updatedPainting);
  };

  const clear = () => {
    setPainting({
      canvas: {
        shape: painting.canvas.shape
      },
      rootSection: {
        color: "white",
        isSplit: false,
        id: new Date().getTime().toString()
      }
    });

    setDetails({
      ...details,
      title: "",
      date: new Date().getTime()
    });
  };

  const save = async () => {
    // Create a copy of the current painting data
    const paintingToSave: SavedPainting = {
      painting,
      details: {
        ...details,
        artist: details.artist || "Anonymous",
        title: details.title || "Untitled"
      }
    };

    try {
      // Save to backend API
      await savePainting(paintingToSave);
      
      // Update parent component
      setUserPainting(paintingToSave);
      
      // Navigate to gallery
      setTab(2, false);
    } catch (error) {
      console.error('Error saving painting:', error);
      alert('Failed to save your painting. Please try again.');
    }
  };

  const updateArtist = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ ...details, artist: e.target.value });
  };

  const updateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ ...details, title: e.target.value });
  };

  const updateCanvasShape = (shape: "square" | "landscape" | "portrait") => {
    setPainting({
      ...painting,
      canvas: { ...painting.canvas, shape }
    });
  };

  return (
    <div>
      <div className="studio__clear" onClick={clear}>New Canvas</div>
      <div className="studio__title">Studio</div>
      <div onClick={() => setTab(2, false)} className="studio__leave">
        -&gt;
      </div>
      <div onClick={() => setTab(2, false)} className="studio__leave--sideways">
        Go to gallery
      </div>
      <div className="studio__peeking-mondrian-container">
        <Image 
          className="studio__peeking-mondrian"
          src={MondrianLeftPortrait}
          alt="Mondrian Portrait"
          width={200}
          height={300}
        />
      </div>
      <div className="studio__canvas-options">
        <div>Canvas</div>
        <ButtonGroup vertical>
          <Button
            className={`studio__canvas-button studio__square-button ${painting.canvas.shape === "square" ? "studio__canvas-button--active" : ""}`}
            onClick={() => updateCanvasShape("square")}
          />
          <Button
            className={`studio__canvas-button studio__landscape-button ${painting.canvas.shape === "landscape" ? "studio__canvas-button--active" : ""}`}
            onClick={() => updateCanvasShape("landscape")}
          />
          <Button
            className={`studio__canvas-button studio__portrait-button ${painting.canvas.shape === "portrait" ? "studio__canvas-button--active" : ""}`}
            onClick={() => updateCanvasShape("portrait")}
          />
        </ButtonGroup>
      </div>
      <div className="studio-container">
        <div className="studio">
          <Canvas painting={painting} paint={updatePainting} />
          <div className="studio__label">
            <Form>
              <Form.Group>
                <div className="name__hint">Label your painting:</div>
                <Form.Control
                  className="studio__input studio__input--artist"
                  type="text"
                  placeholder="Anonymous"
                  value={details.artist}
                  onChange={updateArtist}
                  autoComplete="off"
                />
                <Form.Control
                  className="studio__input studio__input--title"
                  type="text"
                  placeholder="Untitled"
                  value={details.title}
                  onChange={updateTitle}
                  autoComplete="off"
                />
                <div className="name__hint">(mondrian puns actively encouraged)</div>
              </Form.Group>
            </Form>
          </div>
          <div className="studio__save" onClick={save}>
            <GoPin className="icon" /> Hang in the gallery
          </div>
          <div className="studio__canvas-options--mobile">
            <div>Canvas</div>
            <ButtonGroup>
              <Button
                className={`studio__canvas-button--mobile studio__square-button ${painting.canvas.shape === "square" ? "studio__canvas-button--active" : ""}`}
                onClick={() => updateCanvasShape("square")}
              />
              <Button
                className={`studio__canvas-button--mobile studio__landscape-button ${painting.canvas.shape === "landscape" ? "studio__canvas-button--active" : ""}`}
                onClick={() => updateCanvasShape("landscape")}
              />
              <Button
                className={`studio__canvas-button--mobile studio__portrait-button ${painting.canvas.shape === "portrait" ? "studio__canvas-button--active" : ""}`}
                onClick={() => updateCanvasShape("portrait")}
              />
            </ButtonGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio; 