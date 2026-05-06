import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import Folder from "@/models/Folder";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    // Build filter: if folderId is provided, filter by it
    const filter: Record<string, any> = { userId: user.id };
    if (folderId) {
      filter.folderId = folderId;
    }

    const notes = await Note.find(filter).sort({ updatedAt: -1 });
    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    // Enforce folder requirement: use provided folder or 'untitled'
    let folderId = body.folderId;
    if (!folderId) {
      let untitledFolder = await Folder.findOne({ name: "untitled", userId: user.id });
      if (!untitledFolder) {
        untitledFolder = await Folder.create({ name: "untitled", userId: user.id });
      }
      folderId = untitledFolder._id;
    }

    // Force the userId to be the authenticated user
    const noteData = {
      title: body.title,
      content: body.content || null,
      folderId,
      userId: user.id,
    };
    
    const note = await Note.create(noteData);
    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
