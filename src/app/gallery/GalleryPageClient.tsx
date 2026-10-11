"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import Gallery from "../../components/Gallery/Gallery";
import { usePaintings, GalleryOrder } from "../../contexts/PaintingsContext";
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
    order,
    setOrder,
  } = usePaintings();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const studioRef = useRef<HTMLAnchorElement>(null);
  const loadMoreRef = useRef(loadMorePaintings);
  loadMoreRef.current = loadMorePaintings;
  const [showContinue, setShowContinue] = useState(false);
  const [titleFaded, setTitleFaded] = useState(false);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const update = () => {
      const first = track.querySelector("a");
      const view = track.clientWidth;
      if (first && view > 0) {
        const card = first.getBoundingClientRect().width;
        const peek = Math.min(48, Math.max(28, view * 0.03));
        const lead = Math.max(0, (view - card) / 2);
        const gap = Math.max(0, lead - peek);
        track.style.setProperty("--lead", `${lead}px`);
        track.style.setProperty("--gap", `${gap}px`);
      }

      const remaining =
        track.scrollWidth - track.clientWidth - track.scrollLeft;
      if (remaining < track.clientWidth * 1.25) {
        loadMoreRef.current();
      }

      const faded = track.scrollLeft > 24;
      setTitleFaded((current) => (current === faded ? current : faded));

      const hint = hintRef.current;
      if (!hint) {
        setShowContinue(false);
        return;
      }

      const hintRect = hint.getBoundingClientRect();
      const studioRect = studioRef.current?.getBoundingClientRect();
      const hitsStudio = !!studioRect && rectsOverlap(hintRect, studioRect, 12);
      const hitsPainting = [...track.querySelectorAll("a")].some((painting) =>
        rectsOverlap(hintRect, painting.getBoundingClientRect(), 8)
      );
      const next = remaining > 24 && !hitsStudio && !hitsPainting;
      setShowContinue((current) => (current === next ? current : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    const firstPainting = track.querySelector("a");
    if (firstPainting) observer.observe(firstPainting);
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [paintings, loading, hasMore]);

  useEffect(() => {
    if (trackRef.current) trackRef.current.scrollLeft = 0;
  }, [order]);
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
      <h1
        className={galleryStyles.galleryEdgeTitle}
        data-faded={titleFaded ? "true" : "false"}
      >
        Gallery
      </h1>
      <div className={galleryStyles.topBar}>
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
      <div className={galleryStyles.orderGroup}>
        <Link href="/about" className={galleryStyles.aboutLink}>
          About
        </Link>
        <select
          className={galleryStyles.orderSelect}
          value={order}
          aria-label="Order"
          onChange={(event) => setOrder(event.target.value as GalleryOrder)}
          disabled={loading && paintings.length === 0}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="random">Random</option>
        </select>
      </div>
      </div>

      <main className={galleryStyles.galleryMain}>
        {loading && paintings.length === 0 ? (
          <div className={galleryStyles.galleryMessage}>Loading...</div>
        ) : !loading && paintings.length === 0 && activeSearchTerm ? (
          <div className={galleryStyles.galleryMessage}>
            No results found for &quot;{activeSearchTerm}&quot;
          </div>
        ) : (
          <div ref={trackRef} className={galleryStyles.galleryTrack}>
            <Gallery paintings={paintings} />
          </div>
        )}
      </main>

      <Link ref={studioRef} href="/" className={galleryStyles.studioLink}>
        ← Go to studio
      </Link>
      {paintings.length > 1 && (
        <p
          ref={hintRef}
          className={galleryStyles.continueHint}
          data-visible={showContinue ? "true" : "false"}
          aria-hidden="true"
        >
          Exhibition continues{" "}
          <span className={galleryStyles.continueHintEnd}>
            this way [scroll] →
          </span>
        </p>
      )}
    </div>
  );
}

function rectsOverlap(a: DOMRect, b: DOMRect, pad: number) {
  return !(
    a.right + pad <= b.left ||
    a.left >= b.right + pad ||
    a.bottom + pad <= b.top ||
    a.top >= b.bottom + pad
  );
}
