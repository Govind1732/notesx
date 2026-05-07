import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import Note from "@/models/Note";
import Folder from "@/models/Folder";

import { NoteSchema } from "@/lib/validations";

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");

  const filter: Record<string, any> = { userId: user.id };
  if (folderId) {
    filter.folderId = folderId;
  }

  const notes = await Note.find(filter).sort({ updatedAt: -1 });
  const normalizedNotes = notes.map((note) => ({
    ...note.toObject(),
    fileName: note.fileName || note.title || "Untitled",
  }));
  
  return NextResponse.json(normalizedNotes);
});

export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const validatedData = NoteSchema.parse(body);
  
  let folderId = validatedData.folderId;
  
  if (!folderId) {
    let untitledFolder = await Folder.findOne({
      name: "untitled",
      userId: user.id,
    });
    if (!untitledFolder) {
      untitledFolder = await Folder.create({
        name: "untitled",
        userId: user.id,
      });
    }
    folderId = untitledFolder._id;
  }

  const noteData = {
    fileName: validatedData.fileName,
    title: validatedData.title || null,
    content: validatedData.content || null,
    folderId,
    userId: user.id,
  };

  const note = await Note.create(noteData);
  return NextResponse.json(note, { status: 201 });
});
