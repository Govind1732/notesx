import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Folder from "@/models/Folder";
import Note from "@/models/Note";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const folder = await Folder.findByIdAndDelete(id);
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Unlink notes from the deleted folder (set folderId to null)
    await Note.updateMany({ folderId: id }, { folderId: null });

    return NextResponse.json({ message: "Folder deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
