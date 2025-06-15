"use client";

import React from "react";
import { Split, Block } from "../../types/Painting";
import SplitSection from "./SplitSection";
import BlockSection from "./BlockSection";

interface SectionProps {
  section: Split | Block;
  updateSection?: (section: Split | Block) => void;
  static?: boolean;
  linePx?: number;
}

const Section: React.FC<SectionProps> = ({
  section,
  updateSection,
  static: isStatic,
  linePx,
}) => {
  if (section.isSplit) {
    return (
      <SplitSection
        split={section as Split}
        updateSection={updateSection}
        static={isStatic}
        linePx={linePx}
      />
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
