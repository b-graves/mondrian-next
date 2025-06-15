"use client";

import { useState, useEffect, useCallback } from "react";
import Gallery from "../../components/Gallery/Gallery";
import SavedPainting from "../../types/SavedPainting";
import { getPaintings, getPainting } from "../../services/s3Service";
import Link from "next/link";
import styles from "../page.module.css";

interface S3Object {
  Key?: string;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
  StorageClass?: string;
  Owner?: {
    DisplayName?: string;
    ID?: string;
  };
}

export default function GalleryPage() {
  const [gallery, setGallery] = useState<{ paintings: SavedPainting[] }[]>([]);
  const [userPaintings, setUserPaintings] = useState<SavedPainting[]>([]);

  const populateGallery = useCallback(async (files: S3Object[]) => {
    if (!files || files.length === 0) return;

    const sortedFiles = [...files].sort((a, b) => {
      if (a.LastModified && b.LastModified) {
        const dateA =
          a.LastModified instanceof Date
            ? a.LastModified
            : new Date(a.LastModified);
        const dateB =
          b.LastModified instanceof Date
            ? b.LastModified
            : new Date(b.LastModified);
        return dateB.getTime() - dateA.getTime();
      }
      return 0;
    });

    const filesToFetch = sortedFiles.slice(0, 20);
    const room = { paintings: [] as SavedPainting[] };

    for (const file of filesToFetch) {
      if (file.Key) {
        try {
          const painting = await getPainting(file.Key);
          room.paintings.push(painting);
        } catch (error) {
          console.error(`Error fetching painting ${file.Key}:`, error);
        }
      }
    }

    setGallery([room]);
  }, []);

  const fetchPaintings = useCallback(async () => {
    try {
      const data = await getPaintings();
      populateGallery(data.files);
    } catch (error) {
      console.error("Error fetching paintings:", error);
    }
  }, [populateGallery]);

  useEffect(() => {
    fetchPaintings();
  }, [fetchPaintings]);

  return (
    <main className={styles.main}>
      <Gallery rooms={gallery} userPaintings={userPaintings} />
      <Link href="/" className={styles.backButton}>
        ← Back to home
      </Link>
    </main>
  );
}
