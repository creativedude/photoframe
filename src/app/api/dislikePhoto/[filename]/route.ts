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

export async function POST(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = await Promise.resolve(params);
    const settings = loadSettings();

    const PHOTOS_DIR = path.join(
      process.env.PHOTOFRAME_BASE_PATH!,
      "uploads",
      settings.currentFolder
    );
    const DISLIKED_PHOTOS_DIR = path.join(
      process.env.PHOTOFRAME_BASE_PATH!,
      "uploads",
      settings.currentFolder,
      "dislikedphotos"
    );

    const sourcePath = path.join(PHOTOS_DIR, filename);
    const targetPath = path.join(DISLIKED_PHOTOS_DIR, filename);

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Create disliked photos directory if it doesn't exist
    if (!fs.existsSync(DISLIKED_PHOTOS_DIR)) {
      fs.mkdirSync(DISLIKED_PHOTOS_DIR, { recursive: true });
    }

    // Move the file
    fs.renameSync(sourcePath, targetPath);

    return NextResponse.json({
      success: true,
      message: "Photo moved successfully",
    });
  } catch (error) {
    console.error("Error moving photo:", error);
    return NextResponse.json(
      { error: "Failed to move photo" },
      { status: 500 }
    );
  }
}
