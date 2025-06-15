"use client";

import { useState } from "react";
import Studio from "../../components/Studio/Studio";
import SavedPainting from "../../types/SavedPainting";
import Link from "next/link";
import styles from "../page.module.css";

export default function StudioPage() {
  const [, setUserPaintings] = useState<SavedPainting[]>([]);

  const addUserPainting = (userPainting: SavedPainting) => {
    setUserPaintings((prev) => [userPainting, ...prev]);
  };

  return (
    <main className={styles.main}>
      <Studio setUserPainting={addUserPainting} />
      <Link href="/" className={styles.backButton}>
        ← Back to home
      </Link>
    </main>
  );
}
