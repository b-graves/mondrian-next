"use client";

import React, { useState } from "react";
import { Split, Block } from "../../types/Painting";
import { FaPaintBrush } from "react-icons/fa";
import { RiLayoutColumnLine, RiLayoutRowLine } from "react-icons/ri";
import "./Section.css";

interface BlockSectionProps {
  block: Block;
  updateSection?: (section: Split | Block, id: string) => void;
}

const BlockSection: React.FC<BlockSectionProps> = ({
  block,
  updateSection,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const nextColor = () => {
    const colors: ("white" | "red" | "yellow" | "blue" | "black")[] = [
      "white",
      "yellow",
      "red",
      "blue",
      "black",
    ];
    const colorIdx = colors.indexOf(block.color);
    return colors[(colorIdx + 1) % colors.length];
  };

  const createSplit = (direction: "vertical" | "horizontal") => {
    if (!updateSection) return;

    updateSection(
      {
        direction,
        position: 50,
        id: new Date().getTime() + "SPLIT",
        sectionA: {
          color: block.color,
          isSplit: false,
          id: new Date().getTime() + "A",
        },
        sectionB: {
          color: block.color,
          isSplit: false,
          id: new Date().getTime() + "B",
        },
        isSplit: true,
      },
      block.id
    );
  };

  const changeColor = () => {
    if (!updateSection) return;

    const paintedBlock = { ...block, color: nextColor() };
    updateSection(paintedBlock, block.id);
  };

  // If there's no updateSection, just render the block without controls
  if (!updateSection) {
    return (
      <div className={`painting__block painting__block--${block.color}`}>
        <div className="block__centre" id={`target--${block.id}`} />
      </div>
    );
  }

  // Editable block with controls (shown on hover/focus)
  return (
    <div
      className={`painting__block painting__block--${block.color}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      tabIndex={0}
      onFocus={() => setIsHovering(true)}
      onBlur={() => setIsHovering(false)}
      style={{ position: "relative", outline: "none" }}
    >
      <div className="block__centre" id={`target--${block.id}`} />
      {isHovering && (
        <div
          className="painting__controls"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          }}
        >
          <RiLayoutRowLine
            className={`painting__control painting__control--split painting__control--${block.color}`}
            onClick={(e) => {
              e.stopPropagation();
              createSplit("horizontal");
            }}
          />
          <RiLayoutColumnLine
            className={`painting__control painting__control--split painting__control--${block.color}`}
            onClick={(e) => {
              e.stopPropagation();
              createSplit("vertical");
            }}
          />
          <FaPaintBrush
            className={`painting__control painting__control--paint painting__control--${block.color}`}
            onClick={(e) => {
              e.stopPropagation();
              changeColor();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BlockSection;
