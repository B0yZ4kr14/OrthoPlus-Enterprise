import { useState, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { apiClient } from "@/lib/api/apiClient";
import type { SearchResponse, SearchResultItem } from "@orthoplus/shared-types";
import type { GroupedResults, UseGlobalSearchReturn } from "./types";

const LIMIT = 20;

function groupByModule(results: SearchResultItem[]): GroupedResults {
  return results.reduce((acc, item) => {
    const key = item.module || "outros";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as GroupedResults);
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset state when opening/closing
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setPage(1);
      setTotal(0);
      setError(null);
    }
  }, [open]);

  // Reset page and results when query changes
  useEffect(() => {
    setPage(1);
    setResults([]);
    setTotal(0);
    setError(null);
  }, [debouncedQuery]);

  const fetchResults = useCallback(
    async (targetPage: number, append: boolean) => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setTotal(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await apiClient.get<SearchResponse>(
          `/search?q=${encodeURIComponent(debouncedQuery)}&page=${targetPage}&limit=${LIMIT}`,
        );

        setResults((prev) =>
          append ? [...prev, ...data.results] : data.results,
        );
        setTotal(data.total);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao realizar busca";
        setError(message);
        if (!append) {
          setResults([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery],
  );

  // Fetch on debounced query or page change
  useEffect(() => {
    if (!open) return;
    void fetchResults(page, page > 1);
  }, [debouncedQuery, page, open, fetchResults]);

  const loadMore = useCallback(() => {
    if (!loading && results.length < total) {
      setPage((prev) => prev + 1);
    }
  }, [loading, results.length, total]);

  const groupedResults = useMemo(
    () => groupByModule(results),
    [results],
  );

  const hasMore = results.length < total && total > 0;

  return {
    open,
    setOpen,
    query,
    setQuery,
    results,
    groupedResults,
    loading,
    error,
    hasMore,
    loadMore,
    total,
  };
}
