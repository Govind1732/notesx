const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export interface UploadResult {
  url: string;
  public_id: string;
}

/**
 * Validates and uploads an image file to the server.
 * Returns the Supabase URL on success.
 * Throws an error with a user-friendly message on failure.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  // Client-side validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, GIF, and WebP images are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be smaller than 5MB.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Upload failed");
  }

  return res.json();
}
