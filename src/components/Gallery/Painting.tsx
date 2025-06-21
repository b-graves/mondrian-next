"use client";

import React from "react";
import SavedPainting from "../../types/SavedPainting";
import Canvas from "../Canvas/Canvas";
import Link from "next/link";

interface PaintingProps {
  painting: SavedPainting & { key: string; etag?: string };
}

const Painting: React.FC<PaintingProps> = ({ painting }) => {
  // Use ETag as the unique identifier for navigation
  // Remove quotes from ETag if present (S3 ETags are wrapped in quotes)
  const etag = painting.etag
    ? painting.etag.replace(/"/g, "")
    : painting.key?.replace(".json", "");

  return (
    <Link
      href={`/painting/${etag}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div style={{ cursor: "pointer" }}>
        <Canvas gallery={true} painting={painting.painting} />
        <div>
          <div>{painting.details.artist}</div>
          <div>
            <em>{painting.details.title}</em>
          </div>
          <div>{painting.details.year}</div>
        </div>
      </div>
    </Link>
  );
};

export default Painting;
