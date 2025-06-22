"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Gallery from "../../components/Gallery/Gallery";
import { usePaintings } from "../../contexts/PaintingsContext";
import SavedPainting from "../../types/SavedPainting";
import Link from "next/link";
import galleryStyles from "./page.module.css";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const PAGE_SIZE = 100;

export default function GalleryPageClient() {
  const {
    paintings,
    loading,
    hasMore,
    currentPage,
    loadMore,
    search,
    appendPaintings,
  } = usePaintings();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [nextPagePaintings, setNextPagePaintings] = useState<SavedPainting[]>(
    []
  );
  const [preloading, setPreloading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const lastPreloadedPage = useRef(0);

  const activeSearchTerm = searchParams.get("search") || "";

  useEffect(() => {
    const term = searchParams.get("search") || "";
    if (searchInputRef.current) {
      searchInputRef.current.value = term;
    }
    setNextPagePaintings([]);
    lastPreloadedPage.current = 0;
    search(term);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
      } finally {
        setPreloading(false);
      }
    },
    [preloading, hasMore]
  );

  useEffect(() => {
    if (hasMore) {
      preloadNextPage(currentPage + 1, activeSearchTerm);
    }
  }, [currentPage, hasMore, activeSearchTerm, preloadNextPage]);

  const handleSearch = () => {
    const newSearchTerm = searchInputRef.current?.value.trim() ?? "";
    const params = new URLSearchParams(searchParams);
    if (newSearchTerm) {
      params.set("search", newSearchTerm);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      if (nextPagePaintings.length > 0) {
        appendPaintings(nextPagePaintings);
        setNextPagePaintings([]);
      } else {
        loadMore(currentPage + 1, activeSearchTerm);
      }
    }
  };

  return (
    <div className={galleryStyles.galleryContainer}>
      {!loading && (
        <div className={galleryStyles.searchContainer}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
          {activeSearchTerm && (
            <button
              onClick={handleClearSearch}
              disabled={loading}
              className={galleryStyles.searchButton}
            >
              Clear
            </button>
          )}
        </div>
      )}

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "8rem",
        }}
      >
        {loading ? <div>Loading...</div> : <Gallery paintings={paintings} />}

        {!loading && paintings.length === 0 && activeSearchTerm && (
          <div>No results found for &quot;{activeSearchTerm}&quot;</div>
        )}

        {!loading && hasMore && paintings.length > 0 && (
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
