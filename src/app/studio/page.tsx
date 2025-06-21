"use client";

import { useState } from "react";
import Studio from "../../components/Studio/Studio";
import SavedPainting from "../../types/SavedPainting";

export default function StudioPage() {
  const [, setUserPaintings] = useState<SavedPainting[]>([]);

  const addUserPainting = (userPainting: SavedPainting) => {
    setUserPaintings((prev) => [userPainting, ...prev]);
  };

  return (
    <>
      <Studio setUserPainting={addUserPainting} />
    </>
  );
}
