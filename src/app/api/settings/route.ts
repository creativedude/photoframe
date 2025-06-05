import { NextResponse } from "next/server";
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

const BASE_PATH = path.join(process.env.PHOTOFRAME_BASE_PATH!, "uploads");
const SETTINGS_PATH = path.join(
  process.env.PHOTOFRAME_BASE_PATH!,
  "settings.json"
);

type Settings = {
  currentFolder: string;
  displayTime: number;
};

// Initialize settings file if it doesn't exist
async function initializeSettings(): Promise<Settings> {
  if (!fs.existsSync(SETTINGS_PATH)) {
    const defaultSettings: Settings = {
      currentFolder: "",
      displayTime: 30000, // Default to 30 seconds
    };
    await writeFile(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  }
  return JSON.parse(await readFile(SETTINGS_PATH, "utf-8"));
}

export async function GET() {
  try {
    // Get all folders from the base path
    const folders = await readdir(BASE_PATH, { withFileTypes: true });
    const folderNames = folders
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Get current settings
    const settings = await initializeSettings();

    return NextResponse.json({
      folders: folderNames,
      ...settings,
    });
  } catch (error) {
    console.error("Error reading settings:", error);
    return NextResponse.json(
      { error: "Error reading settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { currentFolder, displayTime } = await request.json();

    // Validate the folder exists if it's being changed
    if (currentFolder) {
      const folderPath = path.join(BASE_PATH, currentFolder);
      if (!fs.existsSync(folderPath)) {
        return NextResponse.json(
          { error: "Folder does not exist" },
          { status: 400 }
        );
      }
    }

    // Get current settings to preserve unchanged values
    const currentSettings = await initializeSettings();

    // Update settings
    const settings: Settings = {
      currentFolder: currentFolder ?? currentSettings.currentFolder,
      displayTime: displayTime ?? currentSettings.displayTime,
    };

    await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Error updating settings" },
      { status: 500 }
    );
  }
}
