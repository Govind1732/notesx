import { useState, useEffect, useRef, useMemo } from "react";

interface Searchable {
  _id: string;
  title: string;
  content: string[];
  [key: string]: any;
}

/**
 * Client-side search hook with debounce.
 * Filters items by matching query against title and content (case-insensitive).
 * Designed to be replaceable with server-side search later.
 */
export function useSearch<T extends Searchable>(
  items: T[],
  debounceMs: number = 300
) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce the query
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs]);

  // Filter items based on debounced query
  const filteredItems = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      // Check title
      if (item.title.toLowerCase().includes(q)) return true;
      // Check content (bullet points)
      if (item.content.some((c) => c.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [items, debouncedQuery]);

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    filteredItems,
    isSearching: debouncedQuery.trim().length > 0,
    clearSearch,
  };
}
