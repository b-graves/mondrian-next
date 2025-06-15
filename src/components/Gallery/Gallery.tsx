"use client";

import React, { useCallback, useEffect } from "react";
import SavedPainting from "../../types/SavedPainting";
import Wall from "./Wall";
import "./Gallery.css";

interface GalleryProps {
  rooms: Room[];
  userPaintings: SavedPainting[];
}

interface Room {
  paintings: SavedPainting[];
}

const Gallery: React.FC<GalleryProps> = ({ rooms, userPaintings }) => {
  // Check if scrolled to the right edge
  const isRightEdge = useCallback((el: Element): boolean => {
    return Math.abs(el.scrollLeft + el.clientWidth - el.scrollWidth) < 5;
  }, []);

  // Track scrolling
  const trackScrolling = useCallback(() => {
    const wallElement = document.getElementById("gallery__wall");
    if (wallElement && isRightEdge(wallElement)) {
      console.log("Reached right edge of gallery");
    }
  }, [isRightEdge]);

  // Add/remove scroll listener
  useEffect(() => {
    const wallElement = document.getElementById("gallery__wall");
    if (wallElement) {
      wallElement.addEventListener("scroll", trackScrolling);
      return () => {
        wallElement.removeEventListener("scroll", trackScrolling);
      };
    }
    return undefined;
  }, [trackScrolling]);

  return (
    <div className="gallery">
      <div id="gallery">
        <div className="gallery__title">Gallery</div>
        <Wall userPaintings={userPaintings} rooms={rooms} />
      </div>
    </div>
  );
};

export default Gallery;
