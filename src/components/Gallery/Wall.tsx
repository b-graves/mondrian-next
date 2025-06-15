"use client";

import React from "react";
import SavedPainting from "../../types/SavedPainting";
import Canvas from "../Canvas/Canvas";

interface WallProps {
  painting: SavedPainting;
}

const Wall: React.FC<WallProps> = ({ painting }) => {
  return (
    <>
      <Canvas gallery={true} painting={painting.painting} />
      <div>
        <div>{painting.details.artist}</div>
        <div>
          <em>{painting.details.title}</em>
        </div>
        <div>{painting.details.year}</div>
      </div>
    </>
  );
};

export default Wall;
