import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const PHOTOS_DIR = path.join(process.env.PHOTOFRAME_BASE_PATH!, "web/uploads");

export async function GET() {
  try {
    const folders = await readdir(PHOTOS_DIR, { withFileTypes: true });
    const folderNames = folders
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    return NextResponse.json({ folders: folderNames });
  } catch (error) {
    console.error("Error reading folders:", error);
    return NextResponse.json(
      { error: "Error reading folders" },
      { status: 500 }
    );
  }
}
