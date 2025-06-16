import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { folder: string } }
) {
  try {
    const { folder } = await Promise.resolve(params);

    const PHOTOS_DIR = path.join(
      process.env.PHOTOFRAME_BASE_PATH!,
      "uploads",
      folder
    );

    // Check if directory exists
    if (!fs.existsSync(PHOTOS_DIR)) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Read the directory contents
    const files = fs.readdirSync(PHOTOS_DIR);

    // Filter for image files
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: "No images found in folder" },
        { status: 404 }
      );
    }

    // Get the first image
    const firstImage = imageFiles[0];
    const filePath = path.join(PHOTOS_DIR, firstImage);

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type based on file extension
    const ext = path.extname(firstImage).toLowerCase();
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
    console.error("Error getting first photo:", error);
    return NextResponse.json(
      { error: "Failed to get first photo" },
      { status: 500 }
    );
  }
}
