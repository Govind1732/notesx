import { useState, useCallback } from "react";
import {
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { QueryClient } from "@tanstack/react-query";
import { Note, Folder } from "@/types";

interface UseNoteDnDProps {
  notes: Note[];
  folders: Folder[];
  selectedFolderId: string | null;
  queryClient: QueryClient;
  onNoteMoved?: (note: Note) => void;
}

export function useNoteDnD({
  notes,
  folders,
  selectedFolderId,
  queryClient,
  onNoteMoved,
}: UseNoteDnDProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Note | Folder | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const normalizeId = (id: string | null | undefined) =>
    id == null ? null : String(id);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const active = event.active;
      setActiveId(String(active.id));
      const activeData = active.data.current as { type?: string } | undefined;
      if (activeData?.type === "note") {
        const note = notes.find(
          (item) => normalizeId(item._id) === String(active.id),
        );
        setActiveItem(note ?? null);
      } else if (activeData?.type === "folder") {
        const folder = folders.find((item) => item._id === String(active.id));
        setActiveItem(folder ?? null);
      }
    },
    [folders, notes],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveItem(null);
  }, []);

  const updateFolderOrder = useCallback(
    async (newFolders: Folder[]) => {
      const previousFolders = queryClient.getQueryData<Folder[]>(["folders"]);
      queryClient.setQueryData<Folder[]>(["folders"], newFolders);

      try {
        const res = await fetch("/api/folders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: newFolders.map((folder, index) => ({
              id: folder._id,
              order: index,
            })),
          }),
        });
        if (!res.ok) throw new Error("Failed to update folder order");
      } catch {
        if (previousFolders) {
          queryClient.setQueryData(["folders"], previousFolders);
        }
        queryClient.invalidateQueries({ queryKey: ["folders"] });
      }
    },
    [queryClient],
  );

  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      setActiveId(null);
      setActiveItem(null);
      if (!over) return;

      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;
      const activeIdKey = String(active.id);
      const overIdKey = String(over.id);

      if (activeType === "folder" && overType === "folder") {
        if (activeIdKey === overIdKey) return;

        const activeIndex = folders.findIndex(
          (folder) => folder._id === activeIdKey,
        );
        const overIndex = folders.findIndex(
          (folder) => folder._id === overIdKey,
        );
        if (activeIndex === -1 || overIndex === -1) return;

        const reordered = arrayMove(folders, activeIndex, overIndex);
        await updateFolderOrder(reordered);
        return;
      }

      if (activeType === "note" && overType === "folder") {
        const note = notes.find(
          (item) => normalizeId(item._id) === activeIdKey,
        );
        const targetFolderId = overIdKey;
        if (!note || note.folderId === targetFolderId) return;

        const updatedNote = {
          ...note,
          folderId: targetFolderId,
          updatedAt: new Date().toISOString(),
        };

        // Snapshot previous data
        const previousSourceNotes = queryClient.getQueryData<Note[]>(["notes", selectedFolderId]);
        const previousTargetNotes = queryClient.getQueryData<Note[]>(["notes", targetFolderId]);

        // Optimistic update
        queryClient.setQueryData<Note[]>(
          ["notes", selectedFolderId],
          (old) =>
            old?.filter((item) => normalizeId(item._id) !== activeIdKey) ?? [],
        );

        queryClient.setQueryData<Note[]>(["notes", targetFolderId], (old) =>
          [...(old ?? []), updatedNote]
        );

        onNoteMoved?.(updatedNote);

        try {
          const res = await fetch(`/api/notes/${activeIdKey}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderId: targetFolderId }),
          });
          if (!res.ok) throw new Error("Failed to move note");

          const savedNote = await res.json();
          onNoteMoved?.(savedNote);
          
          queryClient.setQueryData<Note[]>(
            ["notes", targetFolderId],
            (old) =>
              old?.map((item) =>
                normalizeId(item._id) === activeIdKey ? savedNote : item,
              ) ?? old,
          );
        } catch {
          // Strict rollback
          if (previousSourceNotes) {
            queryClient.setQueryData(["notes", selectedFolderId], previousSourceNotes);
          }
          if (previousTargetNotes) {
            queryClient.setQueryData(["notes", targetFolderId], previousTargetNotes);
          }
          
          queryClient.invalidateQueries({
            queryKey: ["notes", selectedFolderId],
          });
          queryClient.invalidateQueries({
            queryKey: ["notes", targetFolderId],
          });
        }
      }
    },
    [
      folders,
      notes,
      queryClient,
      selectedFolderId,
      updateFolderOrder,
      onNoteMoved,
    ],
  );

  return {
    sensors,
    activeId,
    activeItem,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
