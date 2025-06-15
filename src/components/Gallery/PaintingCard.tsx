"use client";

import React from "react";
import SavedPainting from "../../types/SavedPainting";
import Canvas from "../Canvas/Canvas";
import "./PaintingCard.css";

interface PaintingCardProps {
  painting: SavedPainting;
}

const PaintingCard: React.FC<PaintingCardProps> = ({ painting }) => {
  return (
    <div className="painting-card">
      <Canvas gallery={true} painting={painting.painting} />
      <div className="painting-card__label">
        <div>{painting.details.artist}</div>
        <div>
          <em>{painting.details.title}</em>
        </div>
        <div>{painting.details.year}</div>
      </div>
    </div>
  );
};

export default PaintingCard;
