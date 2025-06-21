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
  const pos = split.position || 50;
  const halfLine = linePx / 2;
  const blockAFlexBasis = `calc(${pos}% - ${halfLine}px)`;

  // Draggable area dimensions (wider/taller than the line for accessibility)
  const dragAreaSize = 20;
  const dragAreaOffset = (dragAreaSize - linePx) / 2;

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    console.log("🚀 Drag start triggered", {
      updateSection: !!updateSection,
      containerRef: !!containerRef.current,
    });
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
    const startPercent = split.position || 50;

    dragInfoRef.current = { rect, startPos, startPercent };
    console.log("📏 Initial values captured in ref:", {
      isHorizontal,
      startPos,
      startPercent,
      rect: { width: rect.width, height: rect.height },
      splitId: split.id,
    });

    setIsDragging(true);
    console.log("✅ Drag state set to true");
  };

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    console.log("useEffect: isDragging is true, adding listeners");

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      console.log("🔄 Drag move event fired");
      if (!dragInfoRef.current) {
        console.log("❌ Drag move called but dragInfoRef is null");
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
      newPercent = Math.max(10, Math.min(90, newPercent));

      console.log("🔄 Drag move calculation:", {
        clientPos,
        delta,
        total,
        newPercent,
        originalPercent: split.position,
      });

      if (updateSection) {
        updateSection({ ...split, position: newPercent }, split.id);
      }
    };

    const handleEnd = () => {
      console.log("🏁 Drag end");
      setIsDragging(false);
    };

    console.log("📝 Adding event listeners in useEffect");
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);

    return () => {
      console.log("🧹 Cleaning up event listeners in useEffect");
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, isHorizontal, split, updateSection]);

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
        background:
          isHovered || isDragging ? "rgba(29, 28, 37, 0.3)" : "transparent",
        zIndex: 1,
        cursor: "row-resize",
      }
    : {
        position: "absolute" as const,
        left: `-${dragAreaOffset}px`,
        top: 0,
        width: dragAreaSize,
        height: "100%",
        background:
          isHovered || isDragging ? "rgba(29, 28, 37, 0.3)" : "transparent",
        zIndex: 1,
        cursor: "col-resize",
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
        style={{
          position: "relative",
          flex: `0 0 ${linePx}px`,
          minWidth: 0,
          minHeight: 0,
          height: "100%",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={updateSection ? handleDragStart : undefined}
        onTouchStart={updateSection ? handleDragStart : undefined}
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
