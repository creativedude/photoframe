import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PHOTOS_DIR = path.join(
  process.env.PHOTOFRAME_BASE_PATH!,
  "web/uploads/test"
);
const PHOTO_INTERVAL = 10000; // 10 seconds

// Server-side state
let currentPhotoIndex = 0;
let lastUpdateTime = Date.now();
let photos: string[] = [];
let lastPhotoUpdate = 0;
let lastUserAction = 0;

// Initialize photos list
function initializePhotos() {
  if (fs.existsSync(PHOTOS_DIR)) {
    photos = fs
      .readdirSync(PHOTOS_DIR)
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
  }
  return photos;
}

// Get current photo based on time and user actions
function getCurrentPhoto() {
  const now = Date.now();
  const timeSinceLastUpdate = now - lastUpdateTime;

  // If it's time to update the photo (and no recent user action)
  if (
    timeSinceLastUpdate >= PHOTO_INTERVAL &&
    now - lastUserAction > PHOTO_INTERVAL
  ) {
    const updatesNeeded = Math.floor(timeSinceLastUpdate / PHOTO_INTERVAL);
    currentPhotoIndex = (currentPhotoIndex + updatesNeeded) % photos.length;
    lastUpdateTime = now;
    lastPhotoUpdate = now;
  }

  return {
    photo: photos[currentPhotoIndex],
    nextUpdateIn: PHOTO_INTERVAL - (now - lastPhotoUpdate),
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

  // Refresh photo list for like/dislike actions
  if (action === "like" || action === "dislike") {
    initializePhotos();
    // Adjust current index if needed
    if (currentPhotoIndex >= photos.length) {
      currentPhotoIndex = 0;
    }
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
      // Move to next photo after liking
      currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
      break;
    case "dislike":
      // Move to next photo after disliking
      currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
      break;
  }
}

export async function GET(request: Request) {
  try {
    // Initialize photos if not already done
    if (photos.length === 0) {
      initializePhotos();
    }

    if (photos.length === 0) {
      return NextResponse.json({ error: "No photos found" }, { status: 404 });
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
    return NextResponse.json({ error: "Failed to get photo" }, { status: 500 });
  }
}
