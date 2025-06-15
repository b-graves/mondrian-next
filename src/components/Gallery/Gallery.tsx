"use client";

import React from "react";
import SavedPainting from "../../types/SavedPainting";
import Wall from "./Wall";

interface GalleryProps {
  paintings: SavedPainting[];
}

const Gallery: React.FC<GalleryProps> = ({ paintings }) => {
  return (
    <>
      {paintings.map((painting, idx) => (
        <Wall key={idx} painting={painting} />
      ))}
    </>
  );
};

export default Gallery;
