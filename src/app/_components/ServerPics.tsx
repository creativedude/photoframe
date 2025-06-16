"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Notification from "./Notification";
import PhotoLoader from "./PhotoLoader";
import ServerMenu from "./ServerMenu";

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
    setTimeout(() => setNotification(null), 4000);
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
    const interval = setInterval(() => fetchCurrentPhoto(), 3000);
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

  const [animate, setAnimate] = useState<
    "left" | "right" | "up" | "down" | boolean
  >(false);
  const [hide, setHide] = useState(false);

  const [menuActive, setMenuActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(e.key, menuActive);
      if (isAnimating) return;
      setHide(true);
      if (!menuActive) {
        console.log("not menu active");
        switch (e.key) {
          case "ArrowLeft":
            setAnimate("left");
            showNotification("Previous photo");
            setTimeout(() => {
              fetchCurrentPhoto("prev");
              setAnimate(false);
            }, 500);

            setTimeout(() => {
              setHide(false);
            }, 1000);
            break;
          case "ArrowRight":
            setAnimate("right");
            showNotification("Next photo");
            setTimeout(() => {
              fetchCurrentPhoto("next");
              setAnimate(false);
            }, 500);

            setTimeout(() => {
              setHide(false);
            }, 1000);
            break;
          case "ArrowUp":
            setAnimate("up");
            setTimeout(() => {
              handleLike();
              setAnimate(false);
            }, 500);

            setTimeout(() => {
              setHide(false);
            }, 1000);
            break;
          case "ArrowDown":
            setAnimate("down");
            setTimeout(() => {
              handleDislike();
              setAnimate(false);
            }, 500);

            setTimeout(() => {
              setHide(false);
            }, 1000);
            break;
          case "Enter":
            setMenuActive(true);
            break;
        }
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
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        animate={{
          opacity: hide ? 0 : 1,
          translateX:
            animate === "right" ? "-100%" : animate === "left" ? "100%" : 0,
          translateY:
            animate === "up" ? "-100%" : animate === "down" ? "100%" : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          <PhotoLoader photo={currentPhoto.photo} />
        </AnimatePresence>
      </motion.div>

      <Notification message={notification} />
      {menuActive && <ServerMenu onClose={() => setMenuActive(false)} />}
    </div>
  );
}
