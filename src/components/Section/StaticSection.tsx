import React from "react";
import { Split, Block } from "../../types/Painting";

interface StaticSectionProps {
  section: Split | Block;
  linePx: number;
}

const StaticSection: React.FC<StaticSectionProps> = ({ section, linePx }) => {
  if (section.isSplit) {
    const split = section as Split;
    const isHorizontal = split.direction === "horizontal";
    const direction = isHorizontal ? "column" : "row";
    const pos = split.position || 50;
    // Degenerate splits: only render one side
    if (pos <= 0) {
      return <StaticSection section={split.sectionB} linePx={linePx} />;
    }
    if (pos >= 100) {
      return <StaticSection section={split.sectionA} linePx={linePx} />;
    }
    const halfLine = linePx / 2;
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
          style={{ flex: `0 0 ${blockAFlexBasis}`, minWidth: 0, minHeight: 0 }}
        >
          <StaticSection section={split.sectionA} linePx={linePx} />
        </div>
        <div style={lineStyle} />
        <div style={{ flex: "1 1 0", minWidth: 0, minHeight: 0 }}>
          <StaticSection section={split.sectionB} linePx={linePx} />
        </div>
      </div>
    );
  } else {
    const block = section as Block;
    let color = "#eef0eb";
    if (block.color === "yellow") color = "#f8cb04";
    if (block.color === "red") color = "#b82015";
    if (block.color === "blue") color = "#3652b7";
    if (block.color === "black") color = "#1d1c25";
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: color,
        }}
      />
    );
  }
};

export default StaticSection;
