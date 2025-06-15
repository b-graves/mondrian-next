"use client";

import { useState, useEffect, useCallback } from "react";
import Gallery from "../../components/Gallery/Gallery";
import SavedPainting from "../../types/SavedPainting";
import { getPaintings, getPainting } from "../../services/s3Service";
import Link from "next/link";
import styles from "../page.module.css";

const PAGE_SIZE = 10;

export default function GalleryPage() {
  const [paintings, setPaintings] = useState<SavedPainting[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch a page of paintings
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await getPaintings({ page, pageSize: PAGE_SIZE });
      const loaded: SavedPainting[] = [];
      for (const file of data.files) {
        if (file.Key) {
          try {
            const painting = await getPainting(file.Key);
            loaded.push(painting);
          } catch (error) {
            console.error(`Error fetching painting ${file.Key}:`, error);
          }
        }
      }
      setPaintings((prev) => [...prev, ...loaded]);
      setHasMore(data.hasMore);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching paintings:", error);
    }
    setLoading(false);
  }, [loading, hasMore, page]);

  // Initial load
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line
  }, []);

  return (
    <main className={styles.main}>
      <Gallery paintings={paintings} />
      {loading && <div>Loading...</div>}
      {!loading && hasMore && (
        <button
          onClick={loadMore}
          style={{ margin: "2rem auto", display: "block" }}
        >
          Load More
        </button>
      )}
      <Link href="/" className={styles.backButton}>
        ← Back to home
      </Link>
    </main>
  );
}
