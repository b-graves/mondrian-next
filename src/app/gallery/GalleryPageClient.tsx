"use client";

import { useRef, useEffect } from "react";
import Gallery from "../../components/Gallery/Gallery";
import { usePaintings } from "../../contexts/PaintingsContext";
import Link from "next/link";
import galleryStyles from "./page.module.css";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function GalleryPageClient() {
  const {
    paintings,
    loading,
    hasMore,
    activeSearchTerm,
    loadMorePaintings,
    searchPaintings,
  } = usePaintings();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync the search input with the URL on load
  useEffect(() => {
    const term = searchParams.get("search") || "";
    if (searchInputRef.current) {
      searchInputRef.current.value = term;
    }
    // Let the context handle the initial search logic
  }, [searchParams]);

  const handleSearch = () => {
    const newSearchTerm = searchInputRef.current?.value.trim() ?? "";
    const params = new URLSearchParams(searchParams);
    if (newSearchTerm) {
      params.set("search", newSearchTerm);
    } else {
      params.delete("search");
    }
    // Update URL, which will trigger a re-render and let the context search
    router.push(`${pathname}?${params.toString()}`);
    searchPaintings(newSearchTerm);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
    searchPaintings("");
  };

  return (
    <div className={galleryStyles.galleryContainer}>
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

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "8rem",
        }}
      >
        {loading && paintings.length === 0 ? (
          <div>Loading...</div>
        ) : (
          <Gallery paintings={paintings} />
        )}

        {!loading && paintings.length === 0 && activeSearchTerm && (
          <div>No results found for &quot;{activeSearchTerm}&quot;</div>
        )}

        {!loading && hasMore && paintings.length > 0 && (
          <button
            onClick={loadMorePaintings}
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
