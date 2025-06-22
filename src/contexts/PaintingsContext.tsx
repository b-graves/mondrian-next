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
  currentPage: number;
  loadMore: (page: number, search?: string) => Promise<void>;
  search: (searchTerm: string) => Promise<void>;
  clearSearch: () => Promise<void>;
  appendPaintings: (newPaintings: SavedPainting[]) => void;
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
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async (page: number, search: string = "") => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
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
    } catch (error) {
      console.error("Error loading paintings:", error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const search = useCallback(
    async (searchTerm: string) => {
      await loadMore(1, searchTerm);
    },
    [loadMore]
  );

  const clearSearch = useCallback(async () => {
    await loadMore(1, "");
  }, [loadMore]);

  const appendPaintings = (newPaintings: SavedPainting[]) => {
    setPaintings((prev) => [...prev, ...newPaintings]);
    setCurrentPage((prev) => prev + 1);
  };

  const prependPainting = (newPainting: SavedPainting) => {
    setPaintings((prev) => [newPainting, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  // Preload first batch when app starts
  useEffect(() => {
    loadMore(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: PaintingsContextType = {
    paintings,
    loading,
    hasMore,
    totalCount,
    currentPage,
    loadMore,
    search,
    clearSearch,
    appendPaintings,
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
