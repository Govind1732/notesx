import { z } from "zod";

// Note Schemas
export const NoteSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required").max(100),
  title: z.string().trim().max(100).nullable().optional(),
  content: z.any().optional(),
  folderId: z.string().nullable().optional(),
});

export const NoteUpdateSchema = NoteSchema.partial();

export const NoteMoveSchema = z.object({
  folderId: z.string().min(1, "Folder ID is required"),
});

// Folder Schemas
export const FolderSchema = z.object({
  name: z.string().trim().min(1, "Folder name is required").max(50),
});

export const FolderUpdateSchema = FolderSchema.partial();

export const FolderOrderSchema = z.object({
  order: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
});
