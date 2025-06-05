"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Notification from "./Notification";

type PhotoState = "liked" | "disliked" | undefined;

interface ServerPicsProps {
  photoState?: PhotoState;
}

interface ServerPhoto {
  photo: string;
  nextUpdate: number;
  currentIndex: number;
  totalPhotos: number;
}

export default function ServerPics({ photoState }: ServerPicsProps) {
  const [currentPhoto, setCurrentPhoto] = useState<ServerPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  };

  const fetchCurrentPhoto = async (action?: string) => {
    try {
      const url = action
        ? `/api/getServerPhoto?action=${action}`
        : "/api/getServerPhoto";
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCurrentPhoto(data);
      }
    } catch (err) {
      setError("Failed to fetch photo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentPhoto();
    const interval = setInterval(() => fetchCurrentPhoto(), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLike = async () => {
    if (!currentPhoto || isAnimating) return;

    setIsAnimating(true);
    try {
      const response = await fetch(
        `/api/likePhoto/${encodeURIComponent(currentPhoto.photo)}`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        showNotification("Liked photo");
        await fetchCurrentPhoto("like");
        setIsAnimating(false);
      }
    } catch (err) {
      console.error("Error liking photo:", err);
      setIsAnimating(false);
    }
  };

  const handleDislike = async () => {
    if (!currentPhoto || isAnimating) return;

    setIsAnimating(true);
    try {
      const response = await fetch(
        `/api/dislikePhoto/${encodeURIComponent(currentPhoto.photo)}`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        showNotification("Disliked photo");
        await fetchCurrentPhoto("dislike");
        setIsAnimating(false);
      }
    } catch (err) {
      console.error("Error disliking photo:", err);
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;

      switch (e.key) {
        case "ArrowLeft":
          showNotification("Previous photo");
          fetchCurrentPhoto("prev");
          break;
        case "ArrowRight":
          showNotification("Next photo");
          fetchCurrentPhoto("next");
          break;
        case "ArrowUp":
          handleLike();
          break;
        case "ArrowDown":
          handleDislike();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPhoto, isAnimating]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-2xl text-white">Loading photo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-2xl text-white">{error}</p>
      </div>
    );
  }

  if (!currentPhoto) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-2xl text-white">No photos found</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhoto.photo}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          <Image
            src={`/api/getPhoto/${encodeURIComponent(currentPhoto.photo)}`}
            alt={currentPhoto.photo}
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <Notification message={notification} />
    </div>
  );
}
