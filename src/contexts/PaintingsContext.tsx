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

export type GalleryOrder = "newest" | "oldest" | "random";

interface PaintingsContextType {
  paintings: SavedPainting[];
  loading: boolean;
  hasMore: boolean;
  totalCount: number;
  activeSearchTerm: string;
  loadMorePaintings: () => void;
  searchPaintings: (term: string) => void;
  setOrder: (order: GalleryOrder) => void;
  order: GalleryOrder;
  prependPainting: (newPainting: SavedPainting) => void;
}

const PaintingsContext = createContext<PaintingsContextType | undefined>(
  undefined
);

const PAGE_SIZE = 8;

export const PaintingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [paintings, setPaintings] = useState<SavedPainting[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [order, setOrderState] = useState<GalleryOrder>("newest");
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const searchRef = useRef("");
  const orderRef = useRef<GalleryOrder>("newest");
  const seedRef = useRef(0);
  const totalRef = useRef(0);
  const nextPageRef = useRef<SavedPainting[]>([]);
  const nextHasMoreRef = useRef(false);
  const preloadingRef = useRef(false);
  const pendingLoadMoreRef = useRef(false);
  const fetchGenerationRef = useRef(0);
  const preloadGenerationRef = useRef(0);
  const preloadRef = useRef<
    (
      page: number,
      search: string,
      nextOrder: GalleryOrder,
      seed: number
    ) => Promise<void>
  >(async () => {});
  const loadMoreRef = useRef<() => void>(() => {});

  const rememberPage = (page: number, more: boolean, total: number) => {
    pageRef.current = page;
    hasMoreRef.current = more;
    totalRef.current = total;
    setHasMore(more);
    setTotalCount(total);
  };

  const fetchPaintings = useCallback(
    async (
      page: number,
      search: string,
      nextOrder: GalleryOrder,
      seed: number
    ) => {
      const generation =
        page === 1 ? ++fetchGenerationRef.current : fetchGenerationRef.current;
      if (page !== 1 && loadingRef.current) return;
      loadingRef.current = true;
      pendingLoadMoreRef.current = false;
      if (page === 1) {
        searchRef.current = search;
        orderRef.current = nextOrder;
        seedRef.current = seed;
        nextPageRef.current = [];
        setLoading(true);
      }

      try {
        const data = await getPaintings({
          page,
          pageSize: PAGE_SIZE,
          search,
          order: nextOrder,
          seed,
        });
        if (
          generation !== fetchGenerationRef.current ||
          searchRef.current !== search ||
          orderRef.current !== nextOrder ||
          seedRef.current !== seed
        ) {
          return;
        }

        setPaintings((prev) =>
          page === 1 ? data.paintings : [...prev, ...data.paintings]
        );
        rememberPage(page, data.hasMore, data.total);

        if (data.hasMore) {
          void preloadRef.current(page, search, nextOrder, seed);
        }
      } catch (error) {
        console.error("Error loading paintings:", error);
      } finally {
        if (generation === fetchGenerationRef.current) {
          loadingRef.current = false;
          if (page === 1) setLoading(false);
        }
      }
    },
    []
  );

  const searchPaintings = (term: string) => {
    setActiveSearchTerm(term);
    void fetchPaintings(1, term, orderRef.current, seedRef.current);
  };

  const setOrder = (nextOrder: GalleryOrder) => {
    const seed =
      nextOrder === "random" ? Math.floor(Math.random() * 1_000_000_000) : 0;
    orderRef.current = nextOrder;
    seedRef.current = seed;
    setOrderState(nextOrder);
    preloadGenerationRef.current += 1;
    void fetchPaintings(1, searchRef.current, nextOrder, seed);
  };

  preloadRef.current = async (page, search, nextOrder, seed) => {
    if (!hasMoreRef.current) return;
    const generation = ++preloadGenerationRef.current;
    preloadingRef.current = true;
    try {
      const data = await getPaintings({
        page: page + 1,
        pageSize: PAGE_SIZE,
        search,
        order: nextOrder,
        seed,
      });
      if (generation !== preloadGenerationRef.current) return;
      if (
        searchRef.current !== search ||
        orderRef.current !== nextOrder ||
        seedRef.current !== seed ||
        pageRef.current !== page
      ) {
        return;
      }
      nextPageRef.current = data.paintings;
      nextHasMoreRef.current = data.hasMore;
    } catch (error) {
      console.error("Error preloading next page:", error);
    } finally {
      if (generation !== preloadGenerationRef.current) return;
      preloadingRef.current = false;
      if (pendingLoadMoreRef.current) {
        pendingLoadMoreRef.current = false;
        loadMoreRef.current();
      }
    }
  };

  loadMoreRef.current = () => {
    if (!hasMoreRef.current || loadingRef.current) return;

    if (nextPageRef.current.length > 0) {
      const next = nextPageRef.current;
      const more = nextHasMoreRef.current;
      nextPageRef.current = [];
      setPaintings((prev) => [...prev, ...next]);
      const newPage = pageRef.current + 1;
      rememberPage(newPage, more, totalRef.current);
      if (more) {
        void preloadRef.current(
          newPage,
          searchRef.current,
          orderRef.current,
          seedRef.current
        );
      }
      return;
    }

    pendingLoadMoreRef.current = true;
    if (!preloadingRef.current) {
      void fetchPaintings(
        pageRef.current + 1,
        searchRef.current,
        orderRef.current,
        seedRef.current
      );
    }
  };

  const loadMorePaintings = () => {
    loadMoreRef.current();
  };

  const prependPainting = (newPainting: SavedPainting) => {
    setPaintings((prev) => [newPainting, ...prev]);
    setTotalCount((prev) => {
      totalRef.current = prev + 1;
      return prev + 1;
    });
  };

  useEffect(() => {
    fetchPaintings(1, "", "newest", 0);
  }, [fetchPaintings]);

  const value: PaintingsContextType = {
    paintings,
    loading,
    hasMore,
    totalCount,
    activeSearchTerm,
    loadMorePaintings,
    searchPaintings,
    setOrder,
    order,
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
