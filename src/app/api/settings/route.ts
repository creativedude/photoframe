import { NextResponse } from "next/server";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
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

// Custom error types for better error handling
class SettingsError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "SettingsError";
  }
}

// Error codes and messages
const ERROR_CODES = {
  ENV_MISSING: "ENV_MISSING",
  DIRECTORY_CREATE_FAILED: "DIRECTORY_CREATE_FAILED",
  SETTINGS_READ_FAILED: "SETTINGS_READ_FAILED",
  SETTINGS_WRITE_FAILED: "SETTINGS_WRITE_FAILED",
  SETTINGS_PARSE_FAILED: "SETTINGS_PARSE_FAILED",
  FOLDER_NOT_FOUND: "FOLDER_NOT_FOUND",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  INVALID_SETTINGS: "INVALID_SETTINGS",
} as const;

// Initialize settings file if it doesn't exist
async function initializeSettings(): Promise<Settings> {
  try {
    // Ensure base directory exists
    if (!fs.existsSync(process.env.PHOTOFRAME_BASE_PATH!)) {
      try {
        await mkdir(process.env.PHOTOFRAME_BASE_PATH!, { recursive: true });
      } catch (error) {
        throw new SettingsError(
          "Failed to create base directory",
          ERROR_CODES.DIRECTORY_CREATE_FAILED,
          500,
          { path: process.env.PHOTOFRAME_BASE_PATH, error: String(error) }
        );
      }
    }

    // Ensure uploads directory exists
    if (!fs.existsSync(BASE_PATH)) {
      try {
        await mkdir(BASE_PATH, { recursive: true });
      } catch (error) {
        throw new SettingsError(
          "Failed to create uploads directory",
          ERROR_CODES.DIRECTORY_CREATE_FAILED,
          500,
          { path: BASE_PATH, error: String(error) }
        );
      }
    }

    if (!fs.existsSync(SETTINGS_PATH)) {
      const defaultSettings: Settings = {
        currentFolder: "",
        displayTime: 30000,
      };
      try {
        await writeFile(
          SETTINGS_PATH,
          JSON.stringify(defaultSettings, null, 2)
        );
        return defaultSettings;
      } catch (error) {
        throw new SettingsError(
          "Failed to create settings file",
          ERROR_CODES.SETTINGS_WRITE_FAILED,
          500,
          { path: SETTINGS_PATH, error: String(error) }
        );
      }
    }

    try {
      const settingsContent = await readFile(SETTINGS_PATH, "utf-8");
      try {
        return JSON.parse(settingsContent);
      } catch (error) {
        throw new SettingsError(
          "Failed to parse settings file",
          ERROR_CODES.SETTINGS_PARSE_FAILED,
          500,
          { content: settingsContent, error: String(error) }
        );
      }
    } catch (error) {
      throw new SettingsError(
        "Failed to read settings file",
        ERROR_CODES.SETTINGS_READ_FAILED,
        500,
        { path: SETTINGS_PATH, error: String(error) }
      );
    }
  } catch (error) {
    if (error instanceof SettingsError) {
      throw error;
    }
    throw new SettingsError(
      "Unexpected error during settings initialization",
      ERROR_CODES.SETTINGS_READ_FAILED,
      500,
      { error: String(error) }
    );
  }
}

export async function GET() {
  try {
    if (!process.env.PHOTOFRAME_BASE_PATH) {
      throw new SettingsError(
        "PHOTOFRAME_BASE_PATH environment variable is not set",
        ERROR_CODES.ENV_MISSING,
        500
      );
    }

    // Get all folders from the base path
    try {
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
      if (error instanceof Error && error.message.includes("EACCES")) {
        throw new SettingsError(
          "Permission denied when accessing directories",
          ERROR_CODES.PERMISSION_DENIED,
          403,
          { path: BASE_PATH }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in GET /api/settings:", error);
    if (error instanceof SettingsError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: "Unexpected error reading settings",
        code: ERROR_CODES.SETTINGS_READ_FAILED,
        details: { error: String(error) },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.PHOTOFRAME_BASE_PATH) {
      throw new SettingsError(
        "PHOTOFRAME_BASE_PATH environment variable is not set",
        ERROR_CODES.ENV_MISSING,
        500
      );
    }

    const { currentFolder, displayTime } = await request.json();

    // Validate settings
    if (
      displayTime !== undefined &&
      (typeof displayTime !== "number" || displayTime <= 0)
    ) {
      throw new SettingsError(
        "Invalid display time value",
        ERROR_CODES.INVALID_SETTINGS,
        400,
        { displayTime }
      );
    }

    // Validate the folder exists if it's being changed
    if (currentFolder) {
      const folderPath = path.join(BASE_PATH, currentFolder);
      if (!fs.existsSync(folderPath)) {
        throw new SettingsError(
          "Specified folder does not exist",
          ERROR_CODES.FOLDER_NOT_FOUND,
          400,
          { folder: currentFolder }
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

    try {
      await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    } catch (error) {
      throw new SettingsError(
        "Failed to write settings file",
        ERROR_CODES.SETTINGS_WRITE_FAILED,
        500,
        { path: SETTINGS_PATH, error: String(error) }
      );
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error in POST /api/settings:", error);
    if (error instanceof SettingsError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        error: "Unexpected error updating settings",
        code: ERROR_CODES.SETTINGS_WRITE_FAILED,
        details: { error: String(error) },
      },
      { status: 500 }
    );
  }
}
