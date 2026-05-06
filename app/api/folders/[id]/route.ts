import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Folder from "@/models/Folder";
import Note from "@/models/Note";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const folder = await Folder.findOneAndDelete({ _id: id, userId: user.id });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Move notes to 'untitled' folder instead of unlinking them
    let untitledFolder = await Folder.findOne({ name: "untitled", userId: user.id });
    if (!untitledFolder) {
      untitledFolder = await Folder.create({ name: "untitled", userId: user.id });
    }
    
    await Note.updateMany({ folderId: id, userId: user.id }, { folderId: untitledFolder._id });

    return NextResponse.json({ message: "Folder deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
