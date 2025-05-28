import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PHOTOS_DIR = path.join(process.env.PHOTOFRAME_BASE_PATH!, "web/photos");

console.log("directory", PHOTOS_DIR);

export async function GET() {
  try {
    // Read the directory contents
    const files = fs.readdirSync(PHOTOS_DIR);
    console.log("files", files);

    // Filter for image files (you can adjust the extensions as needed)
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    return NextResponse.json({ photos: imageFiles });
  } catch (error) {
    console.error("Error reading photos directory:", error);
    return NextResponse.json(
      { error: "Failed to read photos directory" },
      { status: 500 }
    );
  }
}
