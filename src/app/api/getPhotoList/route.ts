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
    const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
    return {
      currentFolder: settings.currentFolder || "",
      displayTime: settings.displayTime || 30000,
    };
  }
  return {
    currentFolder: "",
    displayTime: 30000,
  };
}

export async function GET() {
  try {
    // Load current settings
    const settings = loadSettings();

    // Use the current folder from settings
    const PHOTOS_DIR = path.join(
      process.env.PHOTOFRAME_BASE_PATH!,
      "uploads",
      settings.currentFolder
    );

    console.log("directory", PHOTOS_DIR);

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
