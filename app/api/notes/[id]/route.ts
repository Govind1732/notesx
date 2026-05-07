import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import Note from "@/models/Note";
import Folder from "@/models/Folder";
import { NoteUpdateSchema } from "@/lib/validations";

export const GET = withAuth(async (request, { user, params }) => {
  const { id } = await params;
  const note = await Note.findOne({ _id: id, userId: user.id });
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...note.toObject(),
    fileName: note.fileName || note.title || "Untitled",
  });
});

export const PUT = withAuth(async (request, { user, params }) => {
  const { id } = await params;
  const body = await request.json();
  const validatedData = NoteUpdateSchema.parse(body);

  const updateData: Record<string, any> = { ...validatedData };

  // Handle folder assignment if folderId is explicitly provided as null/empty
  if (body.folderId === null || body.folderId === "") {
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
    updateData.folderId = untitledFolder._id;
  }

  const note = await Note.findOneAndUpdate(
    { _id: id, userId: user.id },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...note.toObject(),
    fileName: note.fileName || note.title || "Untitled",
  });
});

export const PATCH = PUT;

export const DELETE = withAuth(async (request, { user, params }) => {
  const { id } = await params;
  const note = await Note.findOneAndDelete({ _id: id, userId: user.id });
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Note deleted successfully" });
});
