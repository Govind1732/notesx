"use client";

import {
  Fragment,
  useEffect,
  useState,
  useCallback,
  type MouseEvent,
} from "react";
import { useDraggable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";
import { useInlineRename } from "./useInlineRename";
import { NoteWithPreview } from "@/hooks/useNotesQuery";
import { useNoteMutations } from "@/hooks/useNoteMutations";
import { memo } from "react";

interface NoteItemProps {
  note: NoteWithPreview;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: (noteId: string) => void;
  onRenameNote?: (noteId: string, fileName: string) => void;
  searchQuery?: string;
}

/**
 * Highlights matching text by wrapping matches in a <mark> element.
 * Returns plain text if no query or no match.
 */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
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
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

const NoteItem = memo(function NoteItem({
  note,
  isSelected,
  onClick,
  onDelete,
  onRenameNote,
  searchQuery = "",
}: NoteItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { saveNote } = useNoteMutations(note.folderId || null);

  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({
      id: note._id,
      data: { type: "note", noteId: note._id, folderId: note.folderId },
    });

  const {
    isRenaming,
    value,
    setValue,
    error,
    inputRef,
    startRename,
    cancelRename,
    saveRename,
    handleInputKeyDown,
  } = useInlineRename(note.fileName || "Untitled", async (trimmedFileName) => {
    await saveNote({
        noteId: note._id,
        data: { fileName: trimmedFileName }
    });
    onRenameNote?.(note._id, trimmedFileName);
  });

  useEffect(() => {
    if (!isSelected || isRenaming) return;

    const handleF2 = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "F2") return;
      if (
        document.activeElement?.closest(
          "input, textarea, [contenteditable='true']",
        )
      )
        return;
      event.preventDefault();
      startRename();
    };

    window.addEventListener("keydown", handleF2);
    return () => window.removeEventListener("keydown", handleF2);
  }, [isRenaming, isSelected, startRename]);

  const handleDoubleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!isSelected) onClick();
    startRename();
  };

  const handleDeleteClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      window.setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    await onDelete(note._id);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative px-2 py-0.5 group transition-all duration-300 ease-out active:scale-[0.98] ${isDragging ? "opacity-30 scale-[0.95]" : "opacity-100"}`}
      {...attributes}
      {...listeners}
    >
      <button
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
        type="button"
        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer flex flex-col gap-1.5 ${
          isSelected
            ? "bg-black/[0.04] dark:bg-white/[0.08] relative z-10 shadow-sm"
            : "hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
        }`}
      >
        <div className="flex items-center gap-3 min-h-[38px]">
          {isRenaming ? (
            <div className="flex-1 min-w-0">
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => {
                  void saveRename();
                }}
                onKeyDown={handleInputKeyDown}
                className="w-full min-w-0 bg-transparent text-[15px] font-semibold outline-none border-none p-0 focus:ring-0"
                aria-label="Rename note"
              />
              {error && (
                <p className="mt-1 text-[12px] text-red-500">{error}</p>
              )}
            </div>
          ) : (
            <h3
              className={`text-[15px] line-clamp-1 ${
                isSelected
                  ? "text-stone-900 dark:text-stone-50 font-semibold"
                  : "text-stone-700 dark:text-stone-300 font-medium"
              }`}
            >
              <HighlightText
                text={note.fileName || "Untitled"}
                query={searchQuery}
              />
            </h3>
          )}
        </div>
        <div className="flex items-center gap-2 text-[13px] text-stone-500 dark:text-stone-400">
          <span className="shrink-0">{formatDate(note.updatedAt)}</span>
          <span className="text-stone-300 dark:text-stone-700">·</span>
          <span className="truncate">
            <HighlightText text={note.previewText} query={searchQuery} />
          </span>
        </div>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          className={`absolute right-3 top-3 rounded-full p-2 transition-all duration-200 text-stone-500 bg-white/90 dark:bg-[#111111]/90 border border-transparent shadow-sm hover:border-stone-200 hover:text-rose-600 dark:hover:text-rose-400 ${
            confirmDelete ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          title={confirmDelete ? "Confirm delete" : "Delete note"}
        >
          {confirmDelete ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">
              Yes
            </span>
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
});

export default NoteItem;
