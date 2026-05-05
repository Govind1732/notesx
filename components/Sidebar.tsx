"use client";

import { useState } from "react";
import { FolderPlus, Folder, Trash2, FileText, X } from "lucide-react";

interface FolderType {
  _id: string;
  name: string;
}

interface SidebarProps {
  folders: FolderType[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onFolderCreated: () => void;
  onFolderDeleted: (folderId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onFolderCreated,
  onFolderDeleted,
  isOpen,
  onClose,
}: SidebarProps) {
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create folder");

      setNewFolderName("");
      setIsCreating(false);
      onFolderCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (
    e: React.MouseEvent,
    folderId: string
  ) => {
    e.stopPropagation();
    if (!confirm("Delete this folder? Notes will be moved to 'All Notes'."))
      return;

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete folder");
      onFolderDeleted(folderId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateFolder();
    if (e.key === "Escape") {
      setIsCreating(false);
      setNewFolderName("");
    }
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
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-stone-50 dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-bold tracking-tight">NotesX</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Folder list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* All Notes */}
          <button
            onClick={() => {
              onSelectFolder(null);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              selectedFolderId === null
                ? "bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>All Notes</span>
          </button>

          {/* Folder items */}
          {folders.map((folder) => (
            <button
              key={folder._id}
              onClick={() => {
                onSelectFolder(folder._id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                selectedFolderId === folder._id
                  ? "bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900"
              }`}
            >
              <Folder className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1 text-left">{folder.name}</span>
              <span
                onClick={(e) => handleDeleteFolder(e, folder._id)}
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-stone-300 dark:hover:bg-stone-700 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </nav>

        {/* New folder input */}
        <div className="px-3 py-4 border-t border-stone-200 dark:border-stone-800">
          {isCreating ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Folder name"
                autoFocus
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg outline-none focus:border-stone-500 dark:focus:border-stone-500 transition-colors"
              />
              <button
                onClick={handleCreateFolder}
                disabled={loading || !newFolderName.trim()}
                className="px-3 py-2 text-sm bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded-lg font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50"
              >
                {loading ? "..." : "Add"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Folder</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
