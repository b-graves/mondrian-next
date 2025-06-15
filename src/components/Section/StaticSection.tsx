import React from "react";
import { Split, Block } from "../../types/Painting";

interface StaticSectionProps {
  section: Split | Block;
}

const LINE_PX = 10;

const StaticSection: React.FC<StaticSectionProps> = ({ section }) => {
  if (section.isSplit) {
    const split = section as Split;
    const isHorizontal = split.direction === "horizontal";
    const direction = isHorizontal ? "column" : "row";
    const pos = split.position || 50;
    const halfLine = LINE_PX / 2;
    const blockAFlexBasis = `calc(${pos}% - ${halfLine}px)`;
    const blockBFlexBasis = `calc(${100 - pos}% - ${halfLine}px)`;
    const lineStyle = isHorizontal
      ? {
          width: "100%",
          height: LINE_PX,
          background: "#1d1c25",
          flex: `0 0 ${LINE_PX}px`,
        }
      : {
          height: "100%",
          width: LINE_PX,
          background: "#1d1c25",
          flex: `0 0 ${LINE_PX}px`,
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
          <StaticSection section={split.sectionA} />
        </div>
        <div style={lineStyle} />
        <div
          style={{ flex: `0 0 ${blockBFlexBasis}`, minWidth: 0, minHeight: 0 }}
        >
          <StaticSection section={split.sectionB} />
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
