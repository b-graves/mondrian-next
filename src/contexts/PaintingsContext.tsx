"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import SavedPainting from "../types/SavedPainting";
import { getPaintings } from "../services/s3Service";

interface PaintingsContextType {
  paintings: SavedPainting[];
  loading: boolean;
  hasMore: boolean;
  totalCount: number;
  activeSearchTerm: string;
  loadMorePaintings: () => void;
  searchPaintings: (term: string) => void;
  prependPainting: (newPainting: SavedPainting) => void;
}

const PaintingsContext = createContext<PaintingsContextType | undefined>(
  undefined
);

const PAGE_SIZE = 100;

export const PaintingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [paintings, setPaintings] = useState<SavedPainting[]>([]);
  const [nextPagePaintings, setNextPagePaintings] = useState<SavedPainting[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [preloading, setPreloading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const loadingRef = useRef(false);

  const preloadNextPage = useCallback(
    async (page: number, search: string) => {
      if (preloading || !hasMore) return;
      setPreloading(true);
      try {
        const data = await getPaintings({
          page: page + 1,
          pageSize: PAGE_SIZE,
          search,
        });
        setNextPagePaintings(data.paintings);
      } catch (error) {
        console.error("Error preloading next page:", error);
      } finally {
        setPreloading(false);
      }
    },
    [preloading, hasMore]
  );

  const fetchPaintings = useCallback(
    async (page: number, search: string) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setNextPagePaintings([]);

      try {
        const data = await getPaintings({
          page,
          pageSize: PAGE_SIZE,
          search,
        });

        setPaintings((prev) =>
          page === 1 ? data.paintings : [...prev, ...data.paintings]
        );
        setHasMore(data.hasMore);
        setTotalCount(data.total);
        setCurrentPage(page);

        // Preload next page if available
        if (data.hasMore) {
          // Use setTimeout to avoid dependency issues
          setTimeout(() => {
            preloadNextPage(page, search);
          }, 0);
        }
      } catch (error) {
        console.error("Error loading paintings:", error);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Remove preloadNextPage dependency to prevent infinite loop
  );

  const searchPaintings = (term: string) => {
    setActiveSearchTerm(term);
    fetchPaintings(1, term);
  };

  const loadMorePaintings = () => {
    if (hasMore && !loading) {
      if (nextPagePaintings.length > 0) {
        setPaintings((prev) => [...prev, ...nextPagePaintings]);
        const newPage = currentPage + 1;
        setCurrentPage(newPage);
        setNextPagePaintings([]);
        // Preload next page if available
        if (hasMore) {
          setTimeout(() => {
            preloadNextPage(newPage, activeSearchTerm);
          }, 0);
        }
      } else {
        fetchPaintings(currentPage + 1, activeSearchTerm);
      }
    }
  };

  const prependPainting = (newPainting: SavedPainting) => {
    setPaintings((prev) => [newPainting, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  useEffect(() => {
    fetchPaintings(1, "");
  }, [fetchPaintings]);

  const value: PaintingsContextType = {
    paintings,
    loading,
    hasMore,
    totalCount,
    activeSearchTerm,
    loadMorePaintings,
    searchPaintings,
    prependPainting,
  };

  return (
    <PaintingsContext.Provider value={value}>
      {children}
    </PaintingsContext.Provider>
  );
};

export const usePaintings = () => {
  const context = useContext(PaintingsContext);
  if (context === undefined) {
    throw new Error("usePaintings must be used within a PaintingsProvider");
  }
  return context;
};
