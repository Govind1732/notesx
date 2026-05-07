"use client";

import { useState, useRef, useEffect } from "react";
import { FolderPlus, FileText, X } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import AccountDropdown from "./AccountDropdown";
import FolderItem from "./FolderItem";
import { Folder } from "@/types";
import { useFolderMutations } from "@/hooks/useFolderMutations";
import { useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { useFoldersQuery } from "@/hooks/useFoldersQuery";
import { Skeleton } from "./Skeleton";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export default function Sidebar({
  isOpen,
  onClose,
  user,
}: SidebarProps) {
  const [selectedFolderId, setSelectedFolderId] = useQueryState("folder", parseAsString);
  const [, setSelectedNoteId] = useQueryState("note", parseAsString);
  
  const { data: folders = [], isLoading } = useFoldersQuery();
  const queryClient = useQueryClient();
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const { createFolder, deleteFolder, isCreating } = useFolderMutations();

  const createFolderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        createFolderRef.current &&
        !createFolderRef.current.contains(e.target as Node)
      ) {
        setIsCreatingFolder(false);
        setNewFolderName("");
      }
    };
    if (isCreatingFolder)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCreatingFolder]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateFolder();
    if (e.key === "Escape") {
      setIsCreatingFolder(false);
      setNewFolderName("");
    }
  };

  const onSelectFolder = (id: string | null) => {
    setSelectedFolderId(id);
    setSelectedNoteId(null);
    onClose();
  };

  const handleFolderRenamed = (folderId: string, newName: string) => {
     queryClient.setQueryData<Folder[]>(
        ["folders"],
        (old) =>
          old?.map((folder) =>
            folder._id === folderId ? { ...folder, name: newName } : folder,
          ) ?? [],
      );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-[#Fcfcfc] dark:bg-[#111111] border-r border-black/[0.04] dark:border-white/[0.04] flex flex-col pb-8 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto md:pb-0 shadow-2xl md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 pb-3">
          <h2 className="text-[14px] font-semibold tracking-tight text-stone-500 uppercase">
            Workspace
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors md:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top actions */}
        <div className="px-3 pb-3" ref={createFolderRef}>
          {isCreatingFolder ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Folder name"
                autoFocus
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-stone-200 dark:border-stone-800 rounded-lg outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
              />
              <button
                onClick={handleCreateFolder}
                disabled={isCreating || !newFolderName.trim()}
                className="px-3 py-2 text-sm bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-lg font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isCreating ? "..." : "Add"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-[14px] font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer border border-transparent shadow-sm"
            >
              <FolderPlus className="w-4 h-4 text-stone-500" />
              <span>New Folder</span>
            </button>
          )}
        </div>

        {/* Folder list */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {/* All Notes */}
          <button
            onClick={() => {
              onSelectFolder(null);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 cursor-pointer ${
              selectedFolderId === null
                ? "bg-black/[0.05] dark:bg-white/[0.08] text-stone-900 dark:text-stone-100"
                : "text-stone-600 dark:text-stone-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>All Notes</span>
          </button>

          {/* Folder items */}
          {isLoading ? (
            <div className="space-y-1 mt-4 px-3">
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ) : folders.length === 0 ? (
            <div className="py-8 px-3 text-center">
              <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                Create your first folder
              </p>
            </div>
          ) : (
            <SortableContext
              items={folders.map((folder) => folder._id)}
              strategy={verticalListSortingStrategy}
            >
              {folders.map((folder) => (
                <FolderItem
                  key={folder._id}
                  folder={folder}
                  isSelected={selectedFolderId === folder._id}
                  existingFolderNames={folders.map((item) => item.name)}
                  onSelect={() => {
                    onSelectFolder(folder._id);
                    onClose();
                  }}
                  onRenameSuccess={(folderId, newName) => {
                    handleFolderRenamed(folderId, newName);
                  }}
                  onDelete={async (folderId) => {
                    await handleDeleteFolder(folderId);
                  }}
                />
              ))}
            </SortableContext>
          )}
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-black/[0.04] dark:border-white/[0.04] mt-auto">
          <AccountDropdown user={user} />
        </div>
      </aside>
    </>
  );
}
