"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Gallery from "../../components/Gallery/Gallery";
import SavedPainting from "../../types/SavedPainting";
import { getPaintings, getPainting } from "../../services/s3Service";
import Link from "next/link";
import styles from "../page.module.css";

const PAGE_SIZE = 10;

export default function GalleryPage() {
  const [paintings, setPaintings] = useState<
    (SavedPainting & { key: string; etag?: string })[]
  >([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const requestIdRef = useRef(0);

  // Fetch a page of paintings (with search)
  const loadMore = useCallback(
    async (pageToLoad = page, searchTerm = search) => {
      if (loading || !hasMore) return;
      setLoading(true);
      const thisRequestId = ++requestIdRef.current;
      try {
        const data = await getPaintings({
          page: pageToLoad,
          pageSize: PAGE_SIZE,
          search: searchTerm,
        });
        const loaded: (SavedPainting & { key: string; etag?: string })[] = [];
        for (const file of data.files) {
          if (file.Key) {
            try {
              const painting = await getPainting(file.Key);
              loaded.push({ ...painting, key: file.Key, etag: file.ETag });
            } catch (error) {
              console.error(`Error fetching painting ${file.Key}:`, error);
            }
          }
        }
        if (thisRequestId === requestIdRef.current) {
          setPaintings((prev) =>
            pageToLoad === 1 ? loaded : [...prev, ...loaded]
          );
          setHasMore(data.hasMore);
        }
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error fetching paintings:", error);
        }
      }
      if (thisRequestId === requestIdRef.current) {
        setLoading(false);
      }
    },
    [loading, hasMore, page, search]
  );

  // Initial load (empty search)
  useEffect(() => {
    setPaintings([]);
    setPage(1);
    setHasMore(true);
    requestIdRef.current++;
    loadMore(1, "");
    // eslint-disable-next-line
  }, []);

  // Handler for Search button
  const handleSearch = () => {
    setPaintings([]);
    setPage(1);
    setHasMore(true);
    setSearch(searchInput.trim());
    requestIdRef.current++;
    loadMore(1, searchInput.trim());
  };

  // Handler for Load More button
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadMore(page + 1, search);
    }
  };

  return (
    <main className={styles.main}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          margin: "2rem auto 1rem",
          maxWidth: 400,
        }}
      >
        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: "0.5rem 1rem",
            fontSize: "1.1rem",
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "0.5rem 1.2rem",
            fontSize: "1.1rem",
            borderRadius: 4,
          }}
        >
          Search
        </button>
      </div>
      <Gallery paintings={paintings} />
      {loading && <div>Loading...</div>}
      {!loading && hasMore && (
        <button
          onClick={handleLoadMore}
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
