import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

if (!process.env.PHOTOFRAME_BASE_PATH) {
  throw new Error("PHOTOFRAME_BASE_PATH environment variable is not set.");
}

const PHOTOS_DIR = path.join(process.env.PHOTOFRAME_BASE_PATH, "web/photos");
const LIKED_PHOTOS_DIR = path.join(
  process.env.PHOTOFRAME_BASE_PATH,
  "web/likedphotos"
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: Request, context: any) {
  try {
    const { filename } = context.params;
    const sourcePath = path.join(PHOTOS_DIR, filename);
    const targetPath = path.join(LIKED_PHOTOS_DIR, filename);

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Create liked photos directory if it doesn't exist
    if (!fs.existsSync(LIKED_PHOTOS_DIR)) {
      fs.mkdirSync(LIKED_PHOTOS_DIR, { recursive: true });
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
