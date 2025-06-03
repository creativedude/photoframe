import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

if (!process.env.PHOTOFRAME_BASE_PATH) {
  throw new Error("PHOTOFRAME_BASE_PATH environment variable is not set.");
}

const PHOTOS_DIR = path.join(process.env.PHOTOFRAME_BASE_PATH, "web/photos");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: Request, context: any) {
  try {
    const { filename } = context.params;
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
