import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PHOTOS_DIR = path.join(process.env.PHOTOFRAME_BASE_PATH!, "web/photos");

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    // Ensure params is properly awaited
    const { filename } = await Promise.resolve(params);
    const filePath = path.join(PHOTOS_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
      }[ext] || "application/octet-stream";

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error streaming photo:", error);
    return NextResponse.json(
      { error: "Failed to stream photo" },
      { status: 500 }
    );
  }
}
