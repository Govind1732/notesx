import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import Folder from "@/models/Folder";
import Note from "@/models/Note";
import { FolderUpdateSchema } from "@/lib/validations";

export const DELETE = withAuth(async (request, { user, params }) => {
  const { id } = await params;

  const folderToVerify = await Folder.findOne({ _id: id, userId: user.id });
  if (!folderToVerify) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  if (folderToVerify.name.toLowerCase() === "untitled") {
    return NextResponse.json(
      { error: "Cannot delete the default folder" },
      { status: 400 },
    );
  }

  await Folder.findOneAndDelete({ _id: id, userId: user.id });

  // Move notes to 'untitled' folder instead of unlinking them
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

  await Note.updateMany(
    { folderId: id, userId: user.id },
    { folderId: untitledFolder._id },
  );

  return NextResponse.json({ message: "Folder deleted successfully" });
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const PATCH = withAuth(async (request, { user, params }) => {
  const { id } = await params;
  const body = await request.json();
  const validatedData = FolderUpdateSchema.parse(body);

  if (validatedData.name) {
    const nameExists = await Folder.findOne({
      userId: user.id,
      name: { $regex: `^${escapeRegExp(validatedData.name)}$`, $options: "i" },
    });

    if (nameExists && nameExists._id.toString() !== id) {
      return NextResponse.json(
        { error: "A folder with this name already exists." },
        { status: 400 },
      );
    }
  }

  const folder = await Folder.findOneAndUpdate(
    { _id: id, userId: user.id },
    validatedData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  return NextResponse.json(folder);
});
