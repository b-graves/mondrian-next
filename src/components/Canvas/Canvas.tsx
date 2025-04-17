'use client';

import React from 'react';
import Painting, { Split, Block } from "../../types/Painting";
import Section from "../Section/Section";
import './Canvas.css';

// Will create the CSS file separately
interface CanvasProps {
  painting: Painting;
  gallery?: boolean;
  paint?: (painting: Painting) => void;
}

const Canvas: React.FC<CanvasProps> = ({ painting, paint, gallery }) => {
  return (
    <div className={gallery ? "canvas__container canvas__container--gallery" : "canvas__container"}>
      <div className={`canvas canvas--${painting.canvas.shape} ${gallery ? 'canvas--gallery' : ''}`}>
        {paint ? (
          <Section 
            section={painting.rootSection} 
            updateSection={(rootSection: Split | Block) => 
              paint({ ...painting, rootSection })} 
          />
        ) : (
          <Section section={painting.rootSection} />
        )}
      </div>
    </div>
  );
};

export default Canvas; 