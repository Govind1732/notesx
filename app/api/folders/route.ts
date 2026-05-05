import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Folder from "@/models/Folder";

export async function GET() {
  try {
    await dbConnect();
    const folders = await Folder.find({}).sort({ createdAt: -1 });
    return NextResponse.json(folders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const folder = await Folder.create(body);
    return NextResponse.json(folder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
