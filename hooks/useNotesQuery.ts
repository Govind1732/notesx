import { useQuery } from "@tanstack/react-query";
import { Note } from "@/types";

/**
 * Extracts plain text preview from Tiptap JSON content.
 */
function getPreviewText(content: any): string {
  if (!content) return "No content";

  // Legacy string[] format
  if (Array.isArray(content)) {
    const filtered = content.filter((c: string) => c.trim());
    return filtered.length > 0
      ? filtered.slice(0, 2).join(" · ")
      : "No content";
  }

  // Tiptap JSON format
  if (content.type === "doc" && Array.isArray(content.content)) {
    const texts: string[] = [];
    const extractText = (node: any) => {
      if (node.text) {
        texts.push(node.text);
      }
      if (node.content) {
        node.content.forEach(extractText);
      }
    };
    content.content.forEach(extractText);
    const joined = texts.join(" ").trim();
    return joined.length > 0
      ? joined.length > 80
        ? joined.slice(0, 80) + "..."
        : joined
      : "No content";
  }

  return "No content";
}

export interface NoteWithPreview extends Note {
  previewText: string;
}

export function useNotesQuery(folderId: string | null) {
  return useQuery({
    queryKey: ["notes", folderId],
    queryFn: async (): Promise<Note[]> => {
      const url = folderId
        ? `/api/notes?folderId=${folderId}`
        : "/api/notes";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
    select: (notes): NoteWithPreview[] => {
      return notes.map((note) => ({
        ...note,
        previewText: getPreviewText(note.content),
      }));
    },
    staleTime: 1000 * 60,
  });
}
