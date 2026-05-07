"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Folder, Trash2 } from "lucide-react";
import { useInlineRename } from "./useInlineRename";
import { Folder as FolderType } from "@/types";
import { memo } from "react";

interface FolderItemProps {
  folder: FolderType;
  isSelected: boolean;
  existingFolderNames: string[];
  onSelect: () => void;
  onRenameSuccess: (folderId: string, newName: string) => void;
  onDelete: (folderId: string) => Promise<void>;
}

const FolderItem = memo(function FolderItem({
  folder,
  isSelected,
  existingFolderNames,
  onSelect,
  onRenameSuccess,
  onDelete,
}: FolderItemProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isDefaultFolder = folder.name.toLowerCase() === "untitled";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: folder._id,
    data: { type: "folder", folderId: folder._id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
  } = useInlineRename(folder.name, async (trimmedName) => {
    if (
      existingFolderNames.some(
        (existing) =>
          existing.toLowerCase() === trimmedName.toLowerCase() &&
          existing.toLowerCase() !== folder.name.toLowerCase(),
      )
    ) {
      throw new Error("A folder with this name already exists.");
    }

    const res = await fetch(`/api/folders/${folder._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: trimmedName }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.error || "Failed to rename folder.");
    }

    onRenameSuccess(folder._id, trimmedName);
  });

  useEffect(() => {
    if (!isSelected || isRenaming) return;

    const handleF2 = (event: KeyboardEvent) => {
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

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDefaultFolder) return;

    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      window.setTimeout(() => setIsConfirmingDelete(false), 3000);
      return;
    }

    await onDelete(folder._id);
  };

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!isSelected) onSelect();
    startRename();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect()}
      onDoubleClick={handleDoubleClick}
      className={`w-full group rounded-xl transition-all duration-300 ease-out cursor-pointer active:scale-[0.98] ${
        isSelected
          ? "bg-black/[0.05] dark:bg-white/[0.08] text-stone-900 dark:text-stone-100 shadow-sm"
          : "text-stone-600 dark:text-stone-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
      } ${isOver ? "ring-2 ring-sky-500/40 dark:ring-sky-400/40 bg-sky-50/80 dark:bg-sky-500/10 shadow-lg shadow-sky-500/5" : ""} ${isDragging ? "shadow-2xl shadow-black/10 scale-[1.02] opacity-50" : ""}`}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <Folder className="w-4 h-4 shrink-0" />

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
              className="w-full min-w-0 bg-transparent text-[14px] font-medium outline-none border-none p-0 focus:ring-0"
              aria-label="Rename folder"
            />
            {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
          </div>
        ) : (
          <span className="truncate flex-1 text-left text-[14px] font-medium">
            {folder.name}
          </span>
        )}

        {!isRenaming && !isDefaultFolder && (
          <button
            onClick={handleDelete}
            type="button"
            className={`px-2 py-1 rounded-full transition-all text-xs font-medium ${
              isConfirmingDelete
                ? "bg-red-500 text-white hover:bg-red-600"
                : "opacity-0 group-hover:opacity-100 hover:bg-black/[0.05] dark:hover:bg-white/[0.1] hover:text-red-600 dark:hover:text-red-400"
            }`}
            title="Delete Folder"
          >
            {isConfirmingDelete ? (
              "Confirm?"
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
});

export default FolderItem;
