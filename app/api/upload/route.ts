import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handler";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const POST = withAuth(async (request, { user, supabase }) => {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
      },
      { status: 400 },
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 },
    );
  }

  // Convert file to array buffer for Supabase Storage
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique file name
  const fileExtension = file.name.split(".").pop() || "png";
  const uniqueId = crypto.randomUUID();
  const fileName = `${user.id}/${uniqueId}.${fileExtension}`;

  // Upload to Supabase Storage bucket 'images'
  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(fileName);

  return NextResponse.json({
    url: publicUrl,
    public_id: fileName,
  });
});
