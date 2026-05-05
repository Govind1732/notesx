"use client";

import { useEffect, useState, useCallback } from "react";
import { PlusIcon, Menu, FileText, Search, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import NoteList from "@/components/NoteList";
import NoteEditor from "@/components/NoteEditor";
import { useSearch } from "@/lib/useSearch";

interface Note {
  _id: string;
  title: string;
  content: string[];
  folderId?: string | null;
  updatedAt: string;
}

interface Folder {
  _id: string;
  name: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);

  // Search hook — operates on current notes (already filtered by folder via API)
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery,
    filteredItems: filteredNotes,
    isSearching,
    clearSearch,
  } = useSearch(notes, 300);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders");
      if (!res.ok) throw new Error("Failed to fetch folders");
      const data = await res.json();
      setFolders(data);
    } catch (err: any) {
      console.error(err.message);
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = selectedFolderId
        ? `/api/notes?folderId=${selectedFolderId}`
        : "/api/notes";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      setNotes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedFolderId]);

  // Fetch folders on mount
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Fetch notes when selected folder changes
  useEffect(() => {
    fetchNotes();
    setSelectedNoteId(null);
    setCreatingNew(false);
    clearSearch();
  }, [fetchNotes]);

  const handleFolderDeleted = (folderId: string) => {
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
    fetchFolders();
    fetchNotes();
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setCreatingNew(false);
  };

  const handleCreateNote = () => {
    setSelectedNoteId(null);
    setCreatingNew(true);
  };

  const handleNoteSaved = (savedNote: {
    _id?: string;
    title: string;
    content: string[];
    folderId?: string | null;
    updatedAt?: string;
  }) => {
    if (creatingNew && savedNote._id) {
      setCreatingNew(false);
      setSelectedNoteId(savedNote._id);
      fetchNotes();
    } else if (savedNote._id) {
      setNotes((prev) =>
        prev.map((n) =>
          n._id === savedNote._id
            ? {
                ...n,
                ...savedNote,
                _id: savedNote._id!,
                updatedAt: savedNote.updatedAt || n.updatedAt,
              }
            : n
        )
      );
    }
  };

  const handleNoteDeleted = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n._id !== noteId));
    setSelectedNoteId(null);
  };

  // Find selected folder name for the header
  const selectedFolderName = selectedFolderId
    ? folders.find((f) => f._id === selectedFolderId)?.name || "Folder"
    : "All Notes";

  // The note currently open in the editor
  const selectedNote = selectedNoteId
    ? notes.find((n) => n._id === selectedNoteId) || null
    : null;

  // New note template
  const newNoteData: Note = {
    _id: "",
    title: "",
    content: [""],
    folderId: selectedFolderId || "",
    updatedAt: new Date().toISOString(),
  };

  // What to show in the editor pane
  const editorNote = creatingNew ? newNoteData : selectedNote;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Panel 1: Sidebar (Folders) */}
      <Sidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onFolderCreated={fetchFolders}
        onFolderDeleted={handleFolderDeleted}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Panel 2: Notes list */}
      <div className="w-72 lg:w-80 shrink-0 border-r border-stone-200 dark:border-stone-800 flex flex-col bg-white dark:bg-stone-950 h-full">
        {/* List header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-bold tracking-tight truncate">
              {selectedFolderName}
            </h1>
          </div>
          <button
            onClick={handleCreateNote}
            className="p-1.5 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
            title="New Note"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-3 py-2.5 border-b border-stone-100 dark:border-stone-800/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-stone-100 dark:bg-stone-900 rounded-lg border-none outline-none placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-700 transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Notes list */}
        <NoteList
          notes={filteredNotes}
          loading={loading}
          error={error}
          selectedNoteId={selectedNoteId}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          searchQuery={debouncedQuery}
          isSearching={isSearching}
        />
      </div>

      {/* Panel 3: Editor */}
      <div className="flex-1 min-w-0 h-full bg-white dark:bg-stone-900/30">
        {editorNote ? (
          <NoteEditor
            key={editorNote._id || "new"}
            note={editorNote}
            folders={folders}
            onDelete={handleNoteDeleted}
            onSaved={handleNoteSaved}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-stone-600">
            <FileText className="w-12 h-12 mb-3" />
            <p className="text-sm">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
