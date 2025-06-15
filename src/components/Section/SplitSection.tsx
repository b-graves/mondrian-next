"use client";

import React, { useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = split.direction === "horizontal";
  const direction = isHorizontal ? "column" : "row";
  const pos = split.position || 50;
  const halfLine = linePx / 2;
  const blockAFlexBasis = `calc(${pos}% - ${halfLine}px)`;
  const lineStyle = isHorizontal
    ? {
        width: linePx,
        height: "100%",
        background: "#1d1c25",
        flex: `0 0 ${linePx}px`,
        cursor: updateSection ? "col-resize" : "default",
        zIndex: 2,
      }
    : {
        width: "100%",
        height: linePx,
        background: "#1d1c25",
        flex: `0 0 ${linePx}px`,
        cursor: updateSection ? "row-resize" : "default",
        zIndex: 2,
      };

  // Drag logic
  const isDragging = useRef(false);

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!updateSection || !containerRef.current) return;
    isDragging.current = true;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const startPos = isHorizontal
      ? "touches" in e
        ? e.touches[0].clientX
        : e.clientX
      : "touches" in e
      ? e.touches[0].clientY
      : e.clientY;
    const startPercent = split.position;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      let clientPos = 0;
      if (moveEvent instanceof TouchEvent) {
        clientPos = isHorizontal
          ? moveEvent.touches[0].clientX
          : moveEvent.touches[0].clientY;
      } else {
        clientPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
      }
      const delta = clientPos - startPos;
      const total = isHorizontal ? rect.width : rect.height;
      let newPercent = startPercent + (delta / total) * 100;
      newPercent = Math.max(10, Math.min(90, newPercent));
      updateSection({ ...split, position: newPercent }, split.id);
    };

    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove as EventListener);
      window.removeEventListener("touchmove", onMove as EventListener);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove as EventListener);
    window.addEventListener("touchmove", onMove as EventListener);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
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
        style={{ ...lineStyle, minWidth: 0, minHeight: 0 }}
        onMouseDown={updateSection ? onDragStart : undefined}
        onTouchStart={updateSection ? onDragStart : undefined}
      />
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
