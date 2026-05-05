"use client";

import { FileText, SearchX } from "lucide-react";
import NoteItem from "./NoteItem";

interface Note {
  _id: string;
  title: string;
  content: string[];
  updatedAt: string;
}

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  error: string;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  searchQuery?: string;
  isSearching?: boolean;
}

export default function NoteList({
  notes,
  loading,
  error,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  searchQuery = "",
  isSearching = false,
}: NoteListProps) {
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex gap-2 items-center text-stone-400">
          <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Empty state when searching yields no results
  if (notes.length === 0 && isSearching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <SearchX className="w-10 h-10 text-stone-300 dark:text-stone-700 mb-3" />
        <p className="text-sm text-stone-500 dark:text-stone-400">
          No results found
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
          Try a different search term
        </p>
      </div>
    );
  }

  // Empty state when no notes exist at all
  if (notes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <FileText className="w-10 h-10 text-stone-300 dark:text-stone-700 mb-3" />
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
          No notes yet
        </p>
        <button
          onClick={onCreateNote}
          className="text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-4 hover:text-stone-600 dark:hover:text-stone-300"
        >
          Create note
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {notes.map((note) => (
        <NoteItem
          key={note._id}
          note={note}
          isSelected={note._id === selectedNoteId}
          onClick={() => onSelectNote(note._id)}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}
