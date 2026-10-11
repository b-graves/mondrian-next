"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const dragHandleRef = useRef<HTMLDivElement | null>(null);
  const touchStartListenerRef = useRef<((event: TouchEvent) => void) | null>(
    null
  );
  const beginDragRef = useRef<(clientPos: number) => void>(() => {});
  const splitRef = useRef(split);
  const updateSectionRef = useRef(updateSection);
  splitRef.current = split;
  updateSectionRef.current = updateSection;
  const isHorizontal = split.direction === "horizontal";
  const direction = isHorizontal ? "column" : "row";
  const pos = split.position ?? 50;

  // Draggable area dimensions (wider/taller than the line for accessibility)
  const dragAreaSize = linePx * 3;

  const stopDrag = () => {
    dragCleanupRef.current?.();
    dragCleanupRef.current = null;
    dragInfoRef.current = null;
    setIsDragging(false);
  };

  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
      document.documentElement.classList.remove("is-dragging-split");
    };
  }, []);

  const beginDrag = (clientPos: number) => {
    if (!updateSectionRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const startPos = clientPos;
    const startPercent = splitRef.current.position ?? 50;

    dragCleanupRef.current?.();
    dragInfoRef.current = { rect, startPos, startPercent };
    document.documentElement.classList.add("is-dragging-split");
    setIsDragging(true);

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!dragInfoRef.current) {
        return;
      }
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
      const { rect: dragRect, startPos: dragStart, startPercent: dragPercent } =
        dragInfoRef.current;

      const point =
        moveEvent instanceof TouchEvent ? moveEvent.touches[0] : moveEvent;
      if (!point) return;

      const clientPos = isHorizontal ? point.clientY : point.clientX;
      const delta = clientPos - dragStart;
      const total = isHorizontal ? dragRect.height : dragRect.width;
      const newPercent = Math.max(
        0,
        Math.min(100, dragPercent + (delta / total) * 100)
      );

      const currentSplit = splitRef.current;
      updateSectionRef.current?.(
        { ...currentSplit, position: newPercent },
        currentSplit.id
      );
    };

    const handleEnd = () => {
      stopDrag();
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);

    dragCleanupRef.current = () => {
      document.documentElement.classList.remove("is-dragging-split");
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
  };

  beginDragRef.current = beginDrag;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    beginDrag(isHorizontal ? e.clientY : e.clientX);
  };

  const setDragHandleRef = useCallback((node: HTMLDivElement | null) => {
    const previous = dragHandleRef.current;
    const previousListener = touchStartListenerRef.current;
    if (previous && previousListener) {
      previous.removeEventListener("touchstart", previousListener);
    }

    dragHandleRef.current = node;
    if (!node) {
      touchStartListenerRef.current = null;
      return;
    }

    // React's onTouchStart is passive, so it cannot cancel scrolling.
    // This native listener can, which keeps a horizontal-split drag from
    // moving the page or triggering pull-to-refresh.
    const onTouchStart = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
      const touch = event.touches[0];
      if (!touch) return;
      const horizontal = splitRef.current.direction === "horizontal";
      beginDragRef.current(horizontal ? touch.clientY : touch.clientX);
    };

    touchStartListenerRef.current = onTouchStart;
    node.addEventListener("touchstart", onTouchStart, { passive: false });
  }, []);

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
    touchAction: "none",
    userSelect: "none",
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
    touchAction: "none",
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
              ref={setDragHandleRef}
              style={draggableAreaStyle}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseDown={handleMouseDown}
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
