'use client';

import React from 'react';
import { Split, Block } from "../../types/Painting";
import Section from "./Section";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import './SplitSection.css';

interface SplitSectionProps {
  split: Split;
  updateSection?: (section: Split | Block) => void;
}

const SplitSection: React.FC<SplitSectionProps> = ({ split, updateSection }) => {
  // Use the new react-resizable-panels library
  const handleResize = (sizes: number[]) => {
    if (updateSection) {
      // Convert the size from the panel library (0-100) to our application's format
      const newPosition = sizes[0];
      if (Math.abs(newPosition - split.position) > 1) {
        updateSection({ ...split, position: newPosition });
      }
    }
  };

  // Editable version with resize functionality
  if (updateSection) {
    return (
      <div className={`split-container split-${split.direction}`}>
        <PanelGroup
          direction={split.direction}
          onLayout={handleResize}
          className={split.id}
        >
          <Panel 
            defaultSize={split.position}
            minSize={10}
          >
            <Section 
              section={split.sectionA} 
              updateSection={(sectionA: Split | Block) => 
                updateSection({ ...split, sectionA })} 
            />
          </Panel>
          <PanelResizeHandle className="resize-handle" />
          <Panel minSize={10}>
            <Section 
              section={split.sectionB} 
              updateSection={(sectionB: Split | Block) => 
                updateSection({ ...split, sectionB })} 
            />
          </Panel>
        </PanelGroup>
      </div>
    );
  }

  // Read-only version (no resize functionality)
  return (
    <div className={`split-container split-${split.direction}`}>
      <PanelGroup
        direction={split.direction}
        className={split.id}
      >
        <Panel 
          defaultSize={split.position}
          minSize={10}
        >
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