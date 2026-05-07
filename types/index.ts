import { Types } from "mongoose";

export interface Folder {
  _id: string;
  name: string;
  order?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  _id: string;
  fileName: string;
  title?: string | null;
  content: any; // Tiptap JSON document
  folderId?: string | null;
  userId?: string;
  createdAt?: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email?: string;
  // Add other Supabase user fields if needed
}
