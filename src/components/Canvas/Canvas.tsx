"use client";

import React, { useRef, useLayoutEffect, useState } from "react";
import Painting, { Split, Block } from "../../types/Painting";
import Section from "../Section/Section";
import "./Canvas.css";

// Will create the CSS file separately
interface CanvasProps {
  painting: Painting;
  gallery?: boolean;
  paint?: (painting: Painting) => void;
}

const LINE_RATIO = 0.0125; // 1.25% of width

function updateSectionById(
  section: Split | Block,
  id: string,
  newSection: Split | Block
): Split | Block {
  if (section.id === id) return newSection;
  if (section.isSplit) {
    return {
      ...section,
      sectionA: updateSectionById(section.sectionA, id, newSection),
      sectionB: updateSectionById(section.sectionB, id, newSection),
    };
  }
  return section;
}

const Canvas: React.FC<CanvasProps> = ({ painting, paint, gallery }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [linePx, setLinePx] = useState<number>(0); // fallback default

  useLayoutEffect(() => {
    if (canvasRef.current) {
      const measure = () => {
        const width = canvasRef.current?.offsetWidth || 0;
        console.log("width", width);
        setLinePx(width * LINE_RATIO);
      };
      measure();
      const ro = new window.ResizeObserver(measure);
      ro.observe(canvasRef.current);
      return () => ro.disconnect();
    }
  }, []);

  return (
    <div
      className={
        gallery
          ? "canvas__container canvas__container--gallery"
          : "canvas__container"
      }
    >
      <div
        ref={canvasRef}
        className={`canvas canvas--${painting.canvas.shape} ${
          gallery ? "canvas--gallery" : ""
        }`}
      >
        {gallery ? (
          <Section section={painting.rootSection} linePx={linePx} />
        ) : paint ? (
          <Section
            section={painting.rootSection}
            updateSection={(updated, id) =>
              paint({
                ...painting,
                rootSection: updateSectionById(
                  painting.rootSection,
                  id,
                  updated
                ),
              })
            }
            linePx={linePx}
          />
        ) : (
          <Section section={painting.rootSection} />
        )}
      </div>
    </div>
  );
};

export default Canvas;
