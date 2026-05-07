import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";
import Folder from "@/models/Folder";
import { FolderSchema, FolderOrderSchema } from "@/lib/validations";

export const GET = withAuth(async (request, { user }) => {
  const folders = await Folder.find({ userId: user.id }).sort({
    order: 1,
    createdAt: -1,
  });
  return NextResponse.json(folders);
});

export const PATCH = withAuth(async (request, { user }) => {
  const body = await request.json();
  const { order } = FolderOrderSchema.parse(body);

  await Promise.all(
    order.map((item: { id: string; order: number }) =>
      Folder.findOneAndUpdate(
        { _id: item.id, userId: user.id },
        { order: item.order },
      ),
    ),
  );

  const folders = await Folder.find({ userId: user.id }).sort({
    order: 1,
    createdAt: -1,
  });
  return NextResponse.json(folders);
});

export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const validatedData = FolderSchema.parse(body);

  const highestOrderFolder = await Folder.findOne({ userId: user.id })
    .sort({ order: -1 })
    .lean();
  const nextOrder = (highestOrderFolder as any)?.order !== undefined ? (highestOrderFolder as any).order + 1 : 0;

  const folderData = { ...validatedData, userId: user.id, order: nextOrder };
  const folder = await Folder.create(folderData);
  return NextResponse.json(folder, { status: 201 });
});
