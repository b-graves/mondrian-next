"use client";

import React, { useRef, useLayoutEffect, useState } from "react";
import Painting, { Split, Block } from "../../types/Painting";
import Section from "../Section/Section";
import StaticSection from "../Section/StaticSection";
import "./Canvas.css";

// Will create the CSS file separately
interface CanvasProps {
  painting: Painting;
  gallery?: boolean;
  paint?: (painting: Painting) => void;
}

const LINE_RATIO = 0.0125; // 1.25% of width

const Canvas: React.FC<CanvasProps> = ({ painting, paint, gallery }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [linePx, setLinePx] = useState<number>(8); // fallback default

  useLayoutEffect(() => {
    if (gallery && canvasRef.current) {
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
  }, [gallery]);

  return (
    <div
      className={
        gallery
          ? "canvas__container canvas__container--gallery"
          : "canvas__container"
      }
    >
      <div
        ref={gallery ? canvasRef : undefined}
        className={`canvas canvas--${painting.canvas.shape} ${
          gallery ? "canvas--gallery" : ""
        }`}
      >
        {gallery ? (
          <StaticSection section={painting.rootSection} linePx={linePx} />
        ) : paint ? (
          <Section
            section={painting.rootSection}
            updateSection={(rootSection: Split | Block) =>
              paint({ ...painting, rootSection })
            }
          />
        ) : (
          <Section section={painting.rootSection} />
        )}
      </div>
    </div>
  );
};

export default Canvas;
