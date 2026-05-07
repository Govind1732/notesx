import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Folder } from "@/types";

export function useFolderMutations() {
  const queryClient = useQueryClient();

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return res.json() as Promise<Folder>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete folder");
      }
      return folderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const renameFolderMutation = useMutation({
    mutationFn: async ({ folderId, name }: { folderId: string; name: string }) => {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to rename folder");
      return res.json() as Promise<Folder>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });

  return {
    createFolder: createFolderMutation.mutateAsync,
    isCreating: createFolderMutation.isPending,
    deleteFolder: deleteFolderMutation.mutateAsync,
    isDeleting: deleteFolderMutation.isPending,
    renameFolder: renameFolderMutation.mutateAsync,
    isRenaming: renameFolderMutation.isPending,
  };
}
