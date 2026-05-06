"use client";

import { FileText, SearchX } from "lucide-react";
import NoteItem from "./NoteItem";

interface Note {
  _id: string;
  title: string;
  content: any; // Tiptap JSON document
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-stone-100 dark:bg-stone-900 rounded-2xl flex items-center justify-center mb-4 border border-stone-200 dark:border-stone-800">
          <SearchX className="w-8 h-8 text-stone-400 dark:text-stone-600" />
        </div>
        <p className="text-[15px] font-medium text-stone-600 dark:text-stone-300">
          No results found
        </p>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
          Try a different search term
        </p>
      </div>
    );
  }

  // Empty state when no notes exist at all
  if (notes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-stone-100 dark:bg-stone-900 rounded-2xl flex items-center justify-center mb-4 border border-stone-200 dark:border-stone-800">
          <FileText className="w-8 h-8 text-stone-400 dark:text-stone-600" />
        </div>
        <p className="text-[15px] font-medium text-stone-600 dark:text-stone-300 mb-5">
          Create your first note
        </p>
        <button
          onClick={onCreateNote}
          className="px-4 py-2.5 text-sm font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          Create Note
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
