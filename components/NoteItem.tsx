"use client";

import React from "react";

interface Note {
  _id: string;
  title: string;
  content: string[];
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

  // Get a preview string from the content array
  const preview =
    note.content.filter((c) => c.trim()).length > 0
      ? note.content
          .filter((c) => c.trim())
          .slice(0, 2)
          .join(" · ")
      : "No content";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-stone-100 dark:border-stone-800/50 transition-colors ${
        isSelected
          ? "bg-stone-200/70 dark:bg-stone-800/70"
          : "hover:bg-stone-100 dark:hover:bg-stone-900/50"
      }`}
    >
      <h3
        className={`text-sm font-semibold mb-1 line-clamp-1 ${
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
