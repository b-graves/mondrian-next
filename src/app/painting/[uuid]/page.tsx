"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SavedPainting from "../../../types/SavedPainting";
import Painting from "../../../components/Gallery/Painting";
import Link from "next/link";
import styles from "../../page.module.css";
import paintingStyles from "./page.module.css";
import { usePaintings } from "../../../contexts/PaintingsContext";

export default function PaintingPage() {
  const params = useParams();
  const { paintings } = usePaintings();
  const [painting, setPainting] = useState<SavedPainting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const findOrFetchPainting = async () => {
      if (!params.uuid) return;

      setLoading(true);
      setError(null);
      const etag = params.uuid as string;

      const existingPainting = paintings.find((p) => p.etag === etag);

      if (existingPainting) {
        setPainting(existingPainting);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/painting/${etag}`);
        if (!response.ok) {
          throw new Error("Painting not found");
        }
        const data = await response.json();
        setPainting(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load painting"
        );
      } finally {
        setLoading(false);
      }
    };

    findOrFetchPainting();
  }, [params.uuid, paintings]);

  if (loading) {
    return (
      <main className={styles.main}>
        <div>Loading...</div>
      </main>
    );
  }

  if (error || !painting) {
    return (
      <main className={styles.main}>
        <div>Error: {error || "Painting not found"}</div>
        <Link href="/gallery" className={paintingStyles.galleryLink}>
          ← Back to gallery
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Use the Painting component but override the Link to prevent navigation */}
        <div style={{ pointerEvents: "none" }}>
          <Painting painting={painting} />
        </div>
      </div>

      <Link href="/gallery" className={paintingStyles.galleryLink}>
        ← Back to gallery
      </Link>
    </main>
  );
}
