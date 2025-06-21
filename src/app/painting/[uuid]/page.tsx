"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Canvas from "../../../components/Canvas/Canvas";
import SavedPainting from "../../../types/SavedPainting";
import Link from "next/link";
import styles from "../../page.module.css";

export default function PaintingPage() {
  const params = useParams();
  const [painting, setPainting] = useState<SavedPainting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPainting = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/painting/${params.uuid}`);
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

    if (params.uuid) {
      fetchPainting();
    }
  }, [params.uuid]);

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
        <Link href="/gallery" className={styles.backButton}>
          ← Back to gallery
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div style={{ marginBottom: "2rem" }}>
        <h1>{painting.details.title}</h1>
        <p>by {painting.details.artist}</p>
        <p>{painting.details.year}</p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          aspectRatio: "1",
          border: "1px solid #ccc",
        }}
      >
        <Canvas painting={painting.painting} />
      </div>

      <Link href="/gallery" className={styles.backButton}>
        ← Back to gallery
      </Link>
    </main>
  );
}
