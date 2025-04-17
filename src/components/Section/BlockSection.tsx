'use client';

import React, { useState } from 'react';
import { Split, Block } from "../../types/Painting";
import { FaPaintBrush } from 'react-icons/fa';
import { RiLayoutColumnLine, RiLayoutRowLine } from 'react-icons/ri';
import { Popover, OverlayTrigger } from 'react-bootstrap';

// Import the CSS file from Section.css separately
import './Section.css';

interface BlockSectionProps {
  block: Block;
  updateSection?: (section: Split | Block) => void;
}

const BlockSection: React.FC<BlockSectionProps> = ({ block, updateSection }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const nextColor = () => {
    const colors: ("white" | "red" | "yellow" | "blue" | "black")[] = ["white", "yellow", "red", "blue", "black"];
    const colorIdx = colors.indexOf(block.color);
    return colors[(colorIdx + 1) % colors.length];
  };
  
  const createSplit = (direction: "vertical" | "horizontal") => {
    if (!updateSection) return;
    
    updateSection({
      direction,
      position: 50,
      id: new Date().getTime() + "SPLIT",
      sectionA: {
        color: block.color,
        isSplit: false,
        id: new Date().getTime() + "A"
      },
      sectionB: {
        color: block.color,
        isSplit: false,
        id: new Date().getTime() + "B"
      },
      isSplit: true
    });
  };
  
  const changeColor = () => {
    if (!updateSection) return;
    
    const paintedBlock = { ...block, color: nextColor() };
    updateSection(paintedBlock);
  };
  
  // If there's no updateSection, just render the block without controls
  if (!updateSection) {
    return (
      <div className={`painting__block painting__block--${block.color}`}>
        <div className="block__centre" id={`target--${block.id}`} />
      </div>
    );
  }
  
  // Generate controls
  const controls = (
    <div className="painting__controls">
      <RiLayoutColumnLine
        className={`painting__control painting__control--split painting__control--${block.color}`}
        onClick={() => createSplit("vertical")}
      />
      <RiLayoutRowLine
        className={`painting__control painting__control--split painting__control--${block.color}`}
        onClick={() => createSplit("horizontal")}
      />
      <FaPaintBrush
        className={`painting__control painting__control--paint painting__control--${block.color}`}
        onClick={changeColor}
      />
    </div>
  );
  
  // Editable block with controls
  const popover = (
    <Popover id={`popover-${block.id}`} className={`popover--${block.color}`}>
      <Popover.Body className={`popover--${block.color}`}>
        {controls}
      </Popover.Body>
    </Popover>
  );
  
  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="bottom"
      overlay={popover}
      show={isHovering}
    >
      <div
        className={`painting__block painting__block--${block.color}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => setIsHovering(!isHovering)}
      >
        <div className="block__centre" id={`target--${block.id}`} />
      </div>
    </OverlayTrigger>
  );
};

export default BlockSection; 