import { useState, useEffect, useRef, useMemo } from "react";

interface Searchable {
  _id: string;
  fileName: string;
  title?: string | null;
  content: any; // Tiptap JSON or legacy string[]
  [key: string]: any;
}

/**
 * Extracts all plain text from a Tiptap JSON document recursively.
 */
function extractTextFromJSON(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.text) return node.text;

  let text = "";
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      text += extractTextFromJSON(child) + " ";
    }
  }
  return text;
}

/**
 * Gets searchable text from content (supports both Tiptap JSON and legacy string[]).
 */
function getSearchableText(content: any): string {
  if (!content) return "";

  // Legacy string[] format
  if (Array.isArray(content)) {
    return content.join(" ");
  }

  // Tiptap JSON format
  return extractTextFromJSON(content);
}

/**
 * Client-side search hook with debounce.
 * Filters items by matching query against title and content (case-insensitive).
 * Designed to be replaceable with server-side search later.
 */
export function useSearch<T extends Searchable>(
  items: T[],
  debounceMs: number = 300,
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
      // Check file name and title
      if (item.fileName.toLowerCase().includes(q)) return true;
      if (item.title?.toLowerCase().includes(q)) return true;
      
      // Use pre-computed previewText for better performance
      const previewText = (item as any).previewText || "";
      if (previewText.toLowerCase().includes(q)) return true;
      
      // Fallback to searching raw content text only if previewText is missing
      // (though it should be there due to the select transformation)
      if (!previewText) {
          const contentText = getSearchableText(item.content);
          if (contentText.toLowerCase().includes(q)) return true;
      }

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
