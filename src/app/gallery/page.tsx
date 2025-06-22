"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Gallery from "../../components/Gallery/Gallery";
import { usePaintings } from "../../contexts/PaintingsContext";
import SavedPainting from "../../types/SavedPainting";
import Link from "next/link";
import galleryStyles from "./page.module.css";

const PAGE_SIZE = 100; // Much larger page size since files are small

export default function GalleryPage() {
  const {
    paintings,
    loading,
    hasMore,
    currentPage,
    loadMore,
    search,
    appendPaintings,
  } = usePaintings();
  const [nextPagePaintings, setNextPagePaintings] = useState<SavedPainting[]>(
    []
  );
  const [preloading, setPreloading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const requestIdRef = useRef(0);
  const lastPreloadedPage = useRef(0);

  // Preload the next page only after a user action (initial load or Load More)
  const preloadNextPage = useCallback(
    async (pageToPreload: number, searchTerm: string) => {
      if (preloading || !hasMore || lastPreloadedPage.current === pageToPreload)
        return;
      setPreloading(true);
      const thisRequestId = ++requestIdRef.current;
      try {
        const data = await fetch(
          `/api/s3?page=${pageToPreload}&pageSize=${PAGE_SIZE}${
            searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
          }`
        );
        const response = await data.json();

        if (thisRequestId === requestIdRef.current) {
          setNextPagePaintings(response.paintings);
          lastPreloadedPage.current = pageToPreload;
        }
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error preloading paintings:", error);
        }
      }
      if (thisRequestId === requestIdRef.current) {
        setPreloading(false);
      }
    },
    [preloading, hasMore]
  );

  // Preload next page only when currentPage changes (user action)
  useEffect(() => {
    if (hasMore) {
      preloadNextPage(currentPage + 1, "");
    }
    // eslint-disable-next-line
  }, [currentPage, hasMore]);

  // Handler for Search button
  const handleSearch = () => {
    setNextPagePaintings([]);
    lastPreloadedPage.current = 0;
    search(searchInput.trim());
  };

  // Handler for Load More button - use preloaded data if available
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      if (nextPagePaintings.length > 0) {
        appendPaintings(nextPagePaintings);
        setNextPagePaintings([]);
      } else {
        loadMore(currentPage + 1);
      }
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
            Load More...
          </button>
        )}
      </main>

      <Link href="/" className={galleryStyles.studioLink}>
        ← Go to studio
      </Link>
    </div>
  );
}
