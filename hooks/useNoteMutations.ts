import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Note } from "@/types";

export function useNoteMutations(selectedFolderId: string | null) {
  const queryClient = useQueryClient();

  const saveNoteMutation = useMutation({
    mutationFn: async ({
      noteId,
      data,
    }: {
      noteId?: string;
      data: Partial<Note>;
    }) => {
      const isNew = !noteId;
      const url = isNew ? "/api/notes" : `/api/notes/${noteId}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to save note");
      }

      return res.json() as Promise<Note>;
    },
    onMutate: async ({ noteId, data }) => {
      if (!noteId) return; // Don't optimistic update for new notes

      await queryClient.cancelQueries({ queryKey: ["notes", selectedFolderId] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes", selectedFolderId]);

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          ["notes", selectedFolderId],
          previousNotes.map((n) =>
            n._id === noteId ? { ...n, ...data, updatedAt: new Date().toISOString() } : n
          )
        );
      }

      return { previousNotes };
    },
    onError: (err, { noteId }, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", selectedFolderId], context.previousNotes);
      }
    },
    onSuccess: (savedNote, { noteId }) => {
      const isNew = !noteId;
      
      if (isNew) {
          // For new notes, we must invalidate to get the new ID and correct order
          queryClient.invalidateQueries({ queryKey: ["notes", selectedFolderId] });
          queryClient.invalidateQueries({ queryKey: ["folders"] });
      } else {
          // Surgical update for existing notes
          queryClient.setQueryData<Note[]>(
            ["notes", selectedFolderId],
            (old) =>
              old?.map((n) =>
                n._id === savedNote._id ? { ...n, ...savedNote } : n,
              ) ?? [],
          );

          // If folder changed, that's a structural change - invalidate both
          if (savedNote.folderId !== selectedFolderId) {
              queryClient.invalidateQueries({ queryKey: ["notes", selectedFolderId] });
              queryClient.invalidateQueries({ queryKey: ["notes", savedNote.folderId] });
          }
      }
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to delete note");
      }
      return noteId;
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes", selectedFolderId] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes", selectedFolderId]);

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          ["notes", selectedFolderId],
          previousNotes.filter((n) => n._id !== noteId)
        );
      }

      return { previousNotes };
    },
    onError: (err, noteId, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", selectedFolderId], context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", selectedFolderId] });
    },
  });

  const moveNoteMutation = useMutation({
    mutationFn: async ({ noteId, targetFolderId }: { noteId: string; targetFolderId: string }) => {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: targetFolderId }),
      });
      if (!res.ok) throw new Error("Failed to move note");
      return res.json() as Promise<Note>;
    },
    onSuccess: (updatedNote, { noteId }) => {
        queryClient.invalidateQueries({ queryKey: ["notes", selectedFolderId] });
        queryClient.invalidateQueries({ queryKey: ["notes", updatedNote.folderId] });
    }
  });

  return {
    saveNote: saveNoteMutation.mutateAsync,
    isSaving: saveNoteMutation.isPending,
    deleteNote: deleteNoteMutation.mutateAsync,
    isDeleting: deleteNoteMutation.isPending,
    moveNote: moveNoteMutation.mutateAsync,
    saveNoteMutation,
    deleteNoteMutation,
    moveNoteMutation,
  };
}
