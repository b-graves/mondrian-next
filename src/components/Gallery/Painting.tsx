"use client";

import React from "react";
import SavedPainting from "../../types/SavedPainting";
import Canvas from "../Canvas/Canvas";
import Link from "next/link";

interface PaintingProps {
  painting: SavedPainting;
}

const Painting: React.FC<PaintingProps> = ({ painting }) => {
  return (
    <Link
      href={`/painting/${painting.etag}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        marginBottom: "4rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Canvas gallery={true} painting={painting.painting} />
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <div>{painting.details.artist}</div>
          <div>
            <em>{painting.details.title}</em>
          </div>
          <div>
            #{painting.number} - {painting.details.year}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Painting;
