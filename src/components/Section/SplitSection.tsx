"use client";

import React, { useState } from "react";
import { Split, Block } from "../../types/Painting";
import Section from "./Section";
import "./SplitSection.css";

interface SplitSectionProps {
  split: Split;
  updateSection?: (section: Split | Block, id: string) => void;
  linePx?: number;
}

const SplitSection: React.FC<SplitSectionProps> = ({
  split,
  updateSection,
  linePx = 8,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isHorizontal = split.direction === "horizontal";
  const direction = isHorizontal ? "column" : "row";
  const pos = split.position || 50;
  const halfLine = linePx / 2;
  const blockAFlexBasis = `calc(${pos}% - ${halfLine}px)`;

  // Draggable area dimensions (wider/taller than the line for accessibility)
  const dragAreaSize = 20;
  const dragAreaOffset = (dragAreaSize - linePx) / 2;

  const lineStyle = isHorizontal
    ? {
        width: "100%",
        height: linePx,
        background: "#1d1c25",
        flex: `0 0 ${linePx}px`,
        zIndex: 2,
        cursor: "row-resize",
      }
    : {
        width: linePx,
        height: "100%",
        background: "#1d1c25",
        flex: `0 0 ${linePx}px`,
        zIndex: 2,
        cursor: "col-resize",
      };

  const overlayStyle = isHorizontal
    ? {
        position: "absolute" as const,
        left: 0,
        top: `-${dragAreaOffset}px`,
        width: "100%",
        height: dragAreaSize,
        background: isHovered ? "rgba(29, 28, 37, 0.3)" : "transparent",
        zIndex: 1,
        cursor: "row-resize",
      }
    : {
        position: "absolute" as const,
        left: `-${dragAreaOffset}px`,
        top: 0,
        width: dragAreaSize,
        height: "100%",
        background: isHovered ? "rgba(29, 28, 37, 0.3)" : "transparent",
        zIndex: 1,
        cursor: "col-resize",
      };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        style={{ flex: `0 0 ${blockAFlexBasis}`, minWidth: 0, minHeight: 0 }}
      >
        <Section
          section={split.sectionA}
          updateSection={updateSection}
          linePx={linePx}
        />
      </div>
      <div
        style={{
          position: "relative",
          flex: `0 0 ${linePx}px`,
          minWidth: 0,
          minHeight: 0,
          height: "100%",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={overlayStyle} />
        <div style={{ ...lineStyle, position: "absolute", top: 0, left: 0 }} />
      </div>
      <div style={{ flex: "1 1 0", minWidth: 0, minHeight: 0 }}>
        <Section
          section={split.sectionB}
          updateSection={updateSection}
          linePx={linePx}
        />
      </div>
    </div>
  );
};

export default SplitSection;
