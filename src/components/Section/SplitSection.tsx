"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragInfoRef = useRef<{
    rect: DOMRect;
    startPos: number;
    startPercent: number;
  } | null>(null);
  const isHorizontal = split.direction === "horizontal";
  const direction = isHorizontal ? "column" : "row";
  const pos = split.position ?? 50;

  // Draggable area dimensions (wider/taller than the line for accessibility)
  const dragAreaSize = linePx * 3;

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!updateSection || !containerRef.current) return;

    e.preventDefault();

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const startPos = isHorizontal
      ? "touches" in e
        ? e.touches[0].clientY
        : e.clientY
      : "touches" in e
      ? e.touches[0].clientX
      : e.clientX;
    const startPercent = split.position ?? 50;

    dragInfoRef.current = { rect, startPos, startPercent };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!dragInfoRef.current) {
        return;
      }
      const { rect, startPos, startPercent } = dragInfoRef.current;

      let clientPos = 0;
      if (moveEvent instanceof TouchEvent) {
        clientPos = isHorizontal
          ? moveEvent.touches[0].clientY
          : moveEvent.touches[0].clientX;
      } else {
        clientPos = isHorizontal ? moveEvent.clientY : moveEvent.clientX;
      }

      const delta = clientPos - startPos;
      const total = isHorizontal ? rect.height : rect.width;
      let newPercent = startPercent + (delta / total) * 100;
      newPercent = Math.max(0, Math.min(100, newPercent));

      if (updateSection) {
        updateSection({ ...split, position: newPercent }, split.id);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, isHorizontal, split, updateSection]);

  // Base styles
  const lineStyle: React.CSSProperties = {
    position: "absolute",
    background: "#1d1c25",
    zIndex: 1,
  };

  const draggableAreaStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 2,
    cursor: isHorizontal ? "row-resize" : "col-resize",
  };

  // Apply orientation-specific styles
  if (isHorizontal) {
    const lineTop = `calc(${pos / 100} * (100% - ${linePx}px))`;
    const draggableAreaTop = `calc((${pos / 100} * (100% - ${linePx}px)) - ${
      (dragAreaSize - linePx) / 2
    }px)`;

    Object.assign(lineStyle, {
      top: lineTop,
      left: 0,
      width: "100%",
      height: `${linePx}px`,
    });
    Object.assign(draggableAreaStyle, {
      top: draggableAreaTop,
      left: 0,
      width: "100%",
      height: `${dragAreaSize}px`,
    });
  } else {
    const lineLeft = `calc(${pos / 100} * (100% - ${linePx}px))`;
    const draggableAreaLeft = `calc((${pos / 100} * (100% - ${linePx}px)) - ${
      (dragAreaSize - linePx) / 2
    }px)`;

    Object.assign(lineStyle, {
      left: lineLeft,
      top: 0,
      height: "100%",
      width: `${linePx}px`,
    });
    Object.assign(draggableAreaStyle, {
      left: draggableAreaLeft,
      top: 0,
      height: "100%",
      width: `${dragAreaSize}px`,
    });
  }

  const overlayStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    background:
      updateSection && (isHovered || isDragging)
        ? "rgba(29, 28, 37, 0.3)"
        : "transparent",
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: direction,
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div style={{ flexBasis: `${pos}%`, minWidth: 0, minHeight: 0 }}>
        <Section
          section={split.sectionA}
          updateSection={updateSection}
          linePx={linePx}
        />
      </div>
      <div style={{ flex: "1 1 auto", minWidth: 0, minHeight: 0 }}>
        <Section
          section={split.sectionB}
          updateSection={updateSection}
          linePx={linePx}
        />
      </div>

      {/* Only render the visual line and draggable area if position is valid */}
      {pos >= 0 && pos <= 100 && (
        <>
          {/* The visual line, positioned to be flush with the edges */}
          <div style={lineStyle} />

          {/* The invisible, larger draggable area that sits on top, centered on the line */}
          {updateSection && (
            <div
              style={draggableAreaStyle}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <div style={overlayStyle} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SplitSection;
