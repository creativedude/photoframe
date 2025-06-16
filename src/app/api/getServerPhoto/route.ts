import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Server-side state
let currentPhotoIndex = 0;
let lastUpdateTime = Date.now();
let photos: string[] = [];
let lastPhotoUpdate = 0;
let lastUserAction = 0;
let currentSettings = {
  currentFolder: "",
  displayTime: 30000,
};

// Initialize photos list
function initializePhotos() {
  const PHOTOS_DIR = path.join(
    process.env.PHOTOFRAME_BASE_PATH!,
    "uploads",
    currentSettings.currentFolder
  );

  console.log("getting photos from PHOTOS_DIR", PHOTOS_DIR);

  if (fs.existsSync(PHOTOS_DIR)) {
    photos = fs
      .readdirSync(PHOTOS_DIR)
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

    // Reset index if it's out of bounds
    if (currentPhotoIndex >= photos.length) {
      currentPhotoIndex = 0;
    }
  } else {
    photos = [];
    currentPhotoIndex = 0;
  }
  return photos;
}

// Load settings from settings.json
function loadSettings() {
  const SETTINGS_PATH = path.join(
    process.env.PHOTOFRAME_BASE_PATH!,
    "settings.json"
  );
  if (fs.existsSync(SETTINGS_PATH)) {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
    currentSettings = {
      currentFolder: settings.currentFolder || "",
      displayTime: settings.displayTime || 30000,
    };
    console.log("Loaded settings from file:", settings);
  } else {
    console.log("No settings file found at:", SETTINGS_PATH);
  }
  return { ...currentSettings }; // Return a new object to ensure we're not referencing the same object
}

// Get current photo based on time and user actions
function getCurrentPhoto() {
  console.log("getting current photo");
  const now = Date.now();
  const timeSinceLastUpdate = now - lastUpdateTime;

  // If it's time to update the photo (and no recent user action)
  if (
    timeSinceLastUpdate >= currentSettings.displayTime &&
    now - lastUserAction > currentSettings.displayTime
  ) {
    const updatesNeeded = Math.floor(
      timeSinceLastUpdate / currentSettings.displayTime
    );
    currentPhotoIndex = (currentPhotoIndex + updatesNeeded) % photos.length;
    lastUpdateTime = now;
    lastPhotoUpdate = now;
    //console.log("photos", photos);
  }
  // console.log("photos", photos);
  // console.log("returning current photo", photos[currentPhotoIndex]);
  // console.log("settings", currentSettings);
  return {
    photo: photos[currentPhotoIndex],
    nextUpdateIn: currentSettings.displayTime - (now - lastPhotoUpdate),
    currentIndex: currentPhotoIndex,
    totalPhotos: photos.length,
  };
}

// Handle user actions
function handleUserAction(action: "next" | "prev" | "like" | "dislike") {
  const now = Date.now();
  lastUserAction = now;
  lastUpdateTime = now;
  lastPhotoUpdate = now;

  // Always refresh photo list for any action
  initializePhotos();

  // If no photos left, return early
  if (photos.length === 0) {
    return;
  }

  switch (action) {
    case "next":
      currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
      break;
    case "prev":
      currentPhotoIndex =
        (currentPhotoIndex - 1 + photos.length) % photos.length;
      break;
    case "like":
    case "dislike":
      // Move to next photo after like/dislike
      currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
      break;
  }
}

export async function GET(request: Request) {
  try {
    // Load current settings
    const settings = loadSettings();

    // Check if folder has changed and reinitialize if needed
    if (settings.currentFolder !== currentSettings.currentFolder) {
      console.log("Folder has changed, reinitializing!");
      console.log("Old folder:", currentSettings.currentFolder);
      console.log("New folder:", settings.currentFolder);
      currentSettings = { ...settings }; // Create new object here too
      photos = [];
      currentPhotoIndex = 0;
      initializePhotos(); // Immediately reinitialize photos with new folder
    }

    // Initialize photos if not already done
    //if (photos.length === 0) {
    initializePhotos();
    //}
    if (currentPhotoIndex >= photos.length) {
      currentPhotoIndex = 0;
    }

    if (photos.length === 0) {
      const PHOTOS_DIR = path.join(
        process.env.PHOTOFRAME_BASE_PATH!,
        "uploads",
        currentSettings.currentFolder
      );
      return NextResponse.json(
        {
          error: "No photos found",
          photosDir: PHOTOS_DIR,
          currentDir: currentSettings.currentFolder,
          settings: currentSettings,
          photos: photos,
        },
        { status: 404 }
      );
    }

    // Check for action parameter
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action && ["next", "prev", "like", "dislike"].includes(action)) {
      handleUserAction(action as "next" | "prev" | "like" | "dislike");
    }

    const currentPhoto = getCurrentPhoto();

    return NextResponse.json({
      photo: currentPhoto.photo,
      nextUpdateIn: currentPhoto.nextUpdateIn,
      currentIndex: currentPhoto.currentIndex,
      totalPhotos: currentPhoto.totalPhotos,
    });
  } catch (error) {
    console.error("Error getting server photo:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
