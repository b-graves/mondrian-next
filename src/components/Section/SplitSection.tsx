"use client";

import React from "react";
import { Split, Block } from "../../types/Painting";
import Section from "./Section";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import "./SplitSection.css";

interface SplitSectionProps {
  split: Split;
  updateSection?: (section: Split | Block) => void;
  static?: boolean;
  linePx?: number;
}

const SplitSection: React.FC<SplitSectionProps> = ({
  split,
  updateSection,
  static: isStatic,
  linePx,
}) => {
  if (isStatic) {
    const isHorizontal = split.direction === "horizontal";
    const direction = isHorizontal ? "column" : "row";
    const pos = split.position || 50;
    if (pos <= 0) {
      return <Section section={split.sectionB} static={true} linePx={linePx} />;
    }
    if (pos >= 100) {
      return <Section section={split.sectionA} static={true} linePx={linePx} />;
    }
    const halfLine = linePx ? linePx / 2 : 0;
    const blockAFlexBasis = `calc(${pos}% - ${halfLine}px)`;
    const lineStyle = isHorizontal
      ? {
          width: "100%",
          height: linePx,
          background: "#1d1c25",
          flex: `0 0 ${linePx}px`,
        }
      : {
          height: "100%",
          width: linePx,
          background: "#1d1c25",
          flex: `0 0 ${linePx}px`,
        };
    return (
      <div
        style={{
          display: "flex",
          flexDirection: direction,
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            flex: `0 0 ${blockAFlexBasis}`,
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <Section section={split.sectionA} static={true} linePx={linePx} />
        </div>
        <div style={lineStyle} />
        <div style={{ flex: "1 1 0", minWidth: 0, minHeight: 0 }}>
          <Section section={split.sectionB} static={true} linePx={linePx} />
        </div>
      </div>
    );
  }

  // Interactive version (resizable panels)
  if (updateSection) {
    const handleResize = (sizes: number[]) => {
      // Convert the size from the panel library (0-100) to our application's format
      const newPosition = sizes[0];
      if (Math.abs(newPosition - split.position) > 1) {
        updateSection({ ...split, position: newPosition });
      }
    };
    return (
      <div className={`split-container split-${split.direction}`}>
        <PanelGroup
          direction={split.direction}
          onLayout={handleResize}
          className={split.id}
        >
          <Panel defaultSize={split.position} minSize={10}>
            <Section
              section={split.sectionA}
              updateSection={(sectionA: Split | Block) =>
                updateSection({ ...split, sectionA })
              }
            />
          </Panel>
          <PanelResizeHandle className="resize-handle" />
          <Panel minSize={10}>
            <Section
              section={split.sectionB}
              updateSection={(sectionB: Split | Block) =>
                updateSection({ ...split, sectionB })
              }
            />
          </Panel>
        </PanelGroup>
      </div>
    );
  }

  // Read-only version (no resize functionality)
  return (
    <div className={`split-container split-${split.direction}`}>
      <PanelGroup direction={split.direction} className={split.id}>
        <Panel defaultSize={split.position} minSize={10}>
          <Section section={split.sectionA} />
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel minSize={10}>
          <Section section={split.sectionB} />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default SplitSection;
