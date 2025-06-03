"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Direction = "left" | "right" | "up" | "down";

export default function Slideshow() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>("right");
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch("/api/getPhotoList");
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPhotos(data.photos);
        // Reset current index if it's out of bounds
        if (currentIndex >= data.photos.length) {
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      setError("Failed to fetch photos");
      console.error("Error fetching photos:", err);
    } finally {
      setLoading(false);
    }
  }, [currentIndex]);

  // Fetch photos on component mount
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const getVariants = (direction: Direction) => {
    const distance = 1000; // pixels to move
    return {
      initial: {
        x:
          direction === "left"
            ? distance
            : direction === "right"
            ? -distance
            : 0,
        y: direction === "up" ? distance : direction === "down" ? -distance : 0,
        opacity: 0,
      },
      animate: {
        x: 0,
        y: 0,
        opacity: 1,
      },
      exit: {
        x:
          direction === "left"
            ? -distance
            : direction === "right"
            ? distance
            : 0,
        y: direction === "up" ? -distance : direction === "down" ? distance : 0,
        opacity: 0,
      },
    };
  };

  const handleLike = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection("up");

    try {
      const response = await fetch(
        `/api/likePhoto/${encodeURIComponent(photos[currentIndex])}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        // Wait for animation to complete before refreshing
        setTimeout(async () => {
          await fetchPhotos();
          setIsAnimating(false);
        }, 500); // Match this with animation duration
      } else {
        console.error("Failed to like photo");
        setIsAnimating(false);
      }
    } catch (err) {
      console.error("Error liking photo:", err);
      setIsAnimating(false);
    }
  }, [isAnimating, photos, currentIndex, fetchPhotos]);

  const handleDislike = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection("down");

    try {
      const response = await fetch(
        `/api/dislikePhoto/${encodeURIComponent(photos[currentIndex])}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        // Wait for animation to complete before refreshing
        setTimeout(async () => {
          await fetchPhotos();
          setIsAnimating(false);
        }, 500); // Match this with animation duration
      } else {
        console.error("Failed to dislike photo");
        setIsAnimating(false);
      }
    } catch (err) {
      console.error("Error disliking photo:", err);
      setIsAnimating(false);
    }
  }, [isAnimating, photos, currentIndex, fetchPhotos]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (photos.length === 0 || isAnimating) return;

      if (e.key === "ArrowRight") {
        setDirection("right");
        setCurrentIndex((current) => (current + 1) % photos.length);
      } else if (e.key === "ArrowLeft") {
        setDirection("left");
        setCurrentIndex(
          (current) => (current - 1 + photos.length) % photos.length
        );
      } else if (e.key === "ArrowUp") {
        await handleLike();
      } else if (e.key === "ArrowDown") {
        await handleDislike();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photos, currentIndex, isAnimating, handleLike, handleDislike]);

  // Handle slideshow timing
  useEffect(() => {
    if (photos.length === 0 || isAnimating) return;

    const timer = setInterval(() => {
      setDirection("right");
      setCurrentIndex((current) => (current + 1) % photos.length);
    }, 10000); // Change photo every 10 seconds

    return () => clearInterval(timer);
  }, [photos.length, isAnimating]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-2xl">Loading photos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-2xl text-red-500">{error}</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-2xl">No photos found</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          variants={getVariants(direction)}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative h-full w-full"
        >
          <Image
            src={`/api/getPhoto/${encodeURIComponent(photos[currentIndex])}`}
            alt={`Photo ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
