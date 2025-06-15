"use client";

import { useState, useEffect } from "react";
import Gallery from "../../components/Gallery/Gallery";
import SavedPainting from "../../types/SavedPainting";
import { getPaintings, getPainting } from "../../services/s3Service";
import Link from "next/link";
import styles from "../page.module.css";

export default function GalleryPage() {
  const [paintings, setPaintings] = useState<SavedPainting[]>([]);

  useEffect(() => {
    async function fetchPaintings() {
      try {
        const data = await getPaintings();
        const sorted = [...data.files].sort((a, b) => {
          const dateA = a.LastModified ? new Date(a.LastModified) : new Date(0);
          const dateB = b.LastModified ? new Date(b.LastModified) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        const filesToFetch = sorted.slice(0, 10);
        const loaded: SavedPainting[] = [];
        for (const file of filesToFetch) {
          if (file.Key) {
            try {
              const painting = await getPainting(file.Key);
              loaded.push(painting);
            } catch (error) {
              console.error(`Error fetching painting ${file.Key}:`, error);
            }
          }
        }
        setPaintings(loaded);
      } catch (error) {
        console.error("Error fetching paintings:", error);
      }
    }
    fetchPaintings();
  }, []);

  return (
    <main className={styles.main}>
      <Gallery paintings={paintings} />
      <Link href="/" className={styles.backButton}>
        ← Back to home
      </Link>
    </main>
  );
}
