import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Load settings from settings.json
function loadSettings() {
  const SETTINGS_PATH = path.join(
    process.env.PHOTOFRAME_BASE_PATH!,
    "settings.json"
  );
  if (fs.existsSync(SETTINGS_PATH)) {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
  }
  return { currentFolder: "" };
}

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    // Load current settings
    const settings = loadSettings();

    // Ensure params is properly awaited
    const { filename } = await Promise.resolve(params);

    const PHOTOS_DIR = path.join(
      process.env.PHOTOFRAME_BASE_PATH!,
      "uploads",
      settings.currentFolder
    );

    const filePath = path.join(PHOTOS_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          error: "Photo not found",
          settings: settings,
          dir: PHOTOS_DIR,
          filePath: filePath,
        },
        { status: 404 }
      );
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
