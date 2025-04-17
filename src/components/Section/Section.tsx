'use client';

import React from 'react';
import { Split, Block } from "../../types/Painting";
import SplitSection from "./SplitSection";
import BlockSection from "./BlockSection";

interface SectionProps {
  section: Split | Block;
  updateSection?: (section: Split | Block) => void;
}

const Section: React.FC<SectionProps> = ({ section, updateSection }) => {
  if (section.isSplit) {
    return updateSection ? (
      <SplitSection split={section as Split} updateSection={updateSection} />
    ) : (
      <SplitSection split={section as Split} />
    );
  } else {
    return updateSection ? (
      <BlockSection block={section as Block} updateSection={updateSection} />
    ) : (
      <BlockSection block={section as Block} />
    );
  }
};

export default Section; 