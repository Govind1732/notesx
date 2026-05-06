"use client";

import React from "react";

interface Note {
  _id: string;
  title: string;
  content: any; // Tiptap JSON document
  updatedAt: string;
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
  searchQuery?: string;
}

/**
 * Highlights matching text by wrapping matches in a <mark> element.
 * Returns plain text if no query or no match.
 */
function HighlightText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-amber-200 dark:bg-amber-500/30 text-inherit rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

/**
 * Extracts plain text preview from Tiptap JSON content.
 * Falls back to handling legacy string[] content.
 */
function getPreviewText(content: any): string {
  if (!content) return "No content";

  // Legacy string[] format
  if (Array.isArray(content)) {
    const filtered = content.filter((c: string) => c.trim());
    return filtered.length > 0
      ? filtered.slice(0, 2).join(" · ")
      : "No content";
  }

  // Tiptap JSON format
  if (content.type === "doc" && Array.isArray(content.content)) {
    const texts: string[] = [];
    const extractText = (node: any) => {
      if (node.text) {
        texts.push(node.text);
      }
      if (node.content) {
        node.content.forEach(extractText);
      }
    };
    content.content.forEach(extractText);
    const joined = texts.join(" ").trim();
    return joined.length > 0
      ? joined.length > 80
        ? joined.slice(0, 80) + "..."
        : joined
      : "No content";
  }

  return "No content";
}

export default function NoteItem({
  note,
  isSelected,
  onClick,
  searchQuery = "",
}: NoteItemProps) {
  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  const preview = getPreviewText(note.content);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 border-b border-stone-100 dark:border-stone-800/50 transition-all duration-200 cursor-pointer ${
        isSelected
          ? "bg-stone-100/80 dark:bg-stone-800/50 shadow-sm relative z-10"
          : "hover:bg-stone-50 dark:hover:bg-stone-900/40"
      }`}
    >
      <h3
        className={`text-[15px] font-semibold mb-1.5 line-clamp-1 ${
          isSelected
            ? "text-stone-900 dark:text-stone-50"
            : "text-stone-800 dark:text-stone-200"
        }`}
      >
        <HighlightText
          text={note.title || "Untitled"}
          query={searchQuery}
        />
      </h3>
      <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
        <span>{formatDate(note.updatedAt)}</span>
        <span>·</span>
        <span className="truncate">
          <HighlightText text={preview} query={searchQuery} />
        </span>
      </div>
    </button>
  );
}
