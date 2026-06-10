import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Uploads a file to Vercel Blob in production, or local disk in development.
 */
export async function uploadPublicFile(
  file: File,
  folder: "audio" | "covers"
): Promise<string> {
  const safeName = sanitizeFilename(file.name);
  const key = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadsDir, { recursive: true });
  const localName = path.basename(key);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, localName), buffer);
  return `/uploads/${folder}/${localName}`;
}
