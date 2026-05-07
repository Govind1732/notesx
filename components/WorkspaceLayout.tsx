"use client";

import { useState, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  DndContext, 
  DragOverlay, 
  pointerWithin,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";
import { Menu, FileText, Search, X, PlusIcon } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import NoteList from "@/components/NoteList";
import NoteEditor from "@/components/NoteEditor";
import { useSearch } from "@/lib/useSearch";
import { useNoteDnD } from "@/hooks/useNoteDnD";
import { useFoldersQuery } from "@/hooks/useFoldersQuery";
import { useNotesQuery } from "@/hooks/useNotesQuery";
import { Note } from "@/types";

interface WorkspaceLayoutProps {
  user: any;
}

function WorkspaceContent({ user }: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const [selectedFolderId] = useQueryState("folder", parseAsString);
  const [selectedNoteId] = useQueryState("note", parseAsString);
  const [creatingNew, setCreatingNew] = useQueryState("new", parseAsBoolean);

  const { data: folders = [] } = useFoldersQuery();
  const { data: notes = [] } = useNotesQuery(selectedFolderId);

  const selectedNoteData = notes.find(n => n._id === selectedNoteId) || null;

  const {
    filteredItems: filteredNotes,
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery,
    isSearching,
    clearSearch,
  } = useSearch(notes, 300);

  const {
    sensors,
    activeId,
    activeItem,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useNoteDnD({
    notes,
    folders,
    selectedFolderId,
    queryClient,
  });

  const selectedFolderName = selectedFolderId
    ? folders.find((f) => f._id === selectedFolderId)?.name || "Folder"
    : "All Notes";

  const newNoteData: Note = {
    _id: "",
    fileName: "Untitled",
    title: null,
    content: null,
    folderId: selectedFolderId || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const editorNote = creatingNew ? newNoteData : selectedNoteData;

  const handleCreateNote = () => {
    setCreatingNew(true);
  };

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0c0a09]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
        />

        <div
          className={`w-full md:w-72 lg:w-80 shrink-0 border-r border-black/[0.04] dark:border-white/[0.04] flex flex-col bg-[#Fcfcfc] dark:bg-[#111111] h-full ${editorNote ? "hidden md:flex" : "flex"}`}
        >
          <div className="flex items-center justify-between px-5 py-5 shrink-0 bg-white/50 dark:bg-[#111111]/50 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors md:hidden cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
              <h1 className="text-sm font-bold tracking-tight truncate">
                {selectedFolderName}
              </h1>
            </div>
            <button
              onClick={handleCreateNote}
              className="p-1.5 bg-black/[0.04] dark:bg-white/[0.08] text-stone-600 dark:text-stone-300 rounded-lg hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors cursor-pointer"
              title="New Note"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-2 shrink-0">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 transition-colors group-focus-within:text-stone-600 dark:group-focus-within:text-stone-300 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-9 py-2 text-[14px] bg-black/[0.03] dark:bg-white/[0.04] rounded-lg border border-transparent outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-1 focus:ring-black/5 dark:focus:ring-white/10 focus:shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-full bg-black/[0.05] dark:bg-white/[0.1] cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <NoteList
            searchQuery={debouncedQuery}
            isSearching={isSearching}
          />
        </div>

        <div
          className={`flex-1 min-w-0 h-full bg-white dark:bg-[#0c0a09] ${editorNote ? "block" : "hidden md:block"}`}
        >
          {editorNote ? (
            <NoteEditor
              key={editorNote._id || "new"}
              note={editorNote}
              folders={folders}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full text-stone-400 dark:text-stone-500 animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl flex items-center justify-center mb-5">
                <FileText className="w-8 h-8 text-stone-300 dark:text-stone-700" />
              </div>
              <p className="text-[15px] font-medium text-stone-500 dark:text-stone-400">
                Select a note or create a new one
              </p>
            </div>
          )}
        </div>
      </div>
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeItem ? (
          <div className="pointer-events-none rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/20 text-sm font-semibold text-stone-900 dark:text-stone-100 scale-105 transition-transform duration-200">
            {"name" in activeItem ? activeItem.name : activeItem.fileName}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default function WorkspaceLayout({ user }: WorkspaceLayoutProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkspaceContent user={user} />
    </Suspense>
  );
}
