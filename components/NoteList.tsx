"use client";

import { FileText, SearchX } from "lucide-react";
import NoteItem from "./NoteItem";
import { Note } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";
import { useNotesQuery } from "@/hooks/useNotesQuery";
import { Skeleton } from "./Skeleton";

interface NoteListProps {
  searchQuery?: string;
  isSearching?: boolean;
}

export default function NoteList({
  searchQuery = "",
  isSearching = false,
}: NoteListProps) {
  const [selectedFolderId] = useQueryState("folder", parseAsString);
  const [selectedNoteId, setSelectedNoteId] = useQueryState("note", parseAsString);
  const [, setCreatingNew] = useQueryState("new", parseAsBoolean);
  
  const { data: notes = [], isLoading: loading, error } = useNotesQuery(selectedFolderId);
  const queryClient = useQueryClient();

  const onSelectNote = (id: string) => {
    setSelectedNoteId(id);
    setCreatingNew(null);
  };

  const onCreateNote = () => {
    setSelectedNoteId(null);
    setCreatingNew(true);
  };

  const onRenameNote = (noteId: string, fileName: string) => {
    queryClient.setQueryData<Note[]>(
      ["notes", selectedFolderId],
      (old) =>
        old?.map((note) =>
          note._id === noteId
            ? { ...note, fileName, updatedAt: new Date().toISOString() }
            : note,
        ) ?? [],
    );
  };

  const onDeleteNote = (noteId: string) => {
    setSelectedNoteId(null);
    const noteIdKey = String(noteId);
    queryClient.setQueryData<Note[]>(
      ["notes", selectedFolderId],
      (old) =>
        old?.filter((note) => String(note._id) !== noteIdKey) ?? [],
    );
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-red-500 text-sm">{error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto py-4 px-6 space-y-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg opacity-50" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state when searching yields no results
  if (notes.length === 0 && isSearching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-stone-400 dark:text-stone-500" />
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
        <div className="w-16 h-16 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-stone-400 dark:text-stone-500" />
        </div>
        <p className="text-[15px] font-medium text-stone-600 dark:text-stone-300 mb-5">
          Create your first note
        </p>
        <button
          onClick={onCreateNote}
          className="px-5 py-2.5 text-[14px] font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          Create Note
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {notes.map((note) => (
        <NoteItem
          key={note._id}
          note={note}
          isSelected={String(note._id) === selectedNoteId}
          onClick={() => onSelectNote(String(note._id))}
          onDelete={onDeleteNote}
          onRenameNote={onRenameNote}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}
