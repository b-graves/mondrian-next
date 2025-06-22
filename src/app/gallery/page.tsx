"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Gallery from "../../components/Gallery/Gallery";
import SavedPainting from "../../types/SavedPainting";
import { getPaintings } from "../../services/s3Service";
import Link from "next/link";
import galleryStyles from "./page.module.css";

const PAGE_SIZE = 10;

export default function GalleryPage() {
  const [paintings, setPaintings] = useState<SavedPainting[]>([]);
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

        if (thisRequestId === requestIdRef.current) {
          setPaintings((prev) =>
            pageToLoad === 1 ? data.paintings : [...prev, ...data.paintings]
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
    <div className={galleryStyles.galleryContainer}>
      <div className={galleryStyles.searchContainer}>
        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={loading}
          className={galleryStyles.searchInput}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={galleryStyles.searchButton}
        >
          Search
        </button>
      </div>

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "8rem", // Pushes content below fixed search bar
        }}
      >
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
      </main>

      <Link href="/" className={galleryStyles.studioLink}>
        ← Go to studio
      </Link>
    </div>
  );
}
