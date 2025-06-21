"use client";

import React from "react";
import SavedPainting from "../../types/SavedPainting";
import Painting from "./Painting";

interface GalleryProps {
  paintings: (SavedPainting & { key: string; etag?: string })[];
}

const Gallery: React.FC<GalleryProps> = ({ paintings }) => {
  return (
    <>
      {paintings.map((painting, idx) => (
        <Painting key={idx} painting={painting} />
      ))}
    </>
  );
};

export default Gallery;
