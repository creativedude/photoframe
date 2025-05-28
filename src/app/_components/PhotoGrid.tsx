"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type PhotoState = "liked" | "disliked" | undefined;

interface PhotoGridProps {
  photoState?: PhotoState;
}

export default function PhotoGrid({ photoState }: PhotoGridProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingPhoto, setRemovingPhoto] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/getPhotoList");
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPhotos(data.photos);
      }
    } catch (err) {
      setError("Failed to fetch photos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleLike = async (filename: string) => {
    setRemovingPhoto(filename);
    try {
      const response = await fetch(
        `/api/likePhoto/${encodeURIComponent(filename)}`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        setTimeout(async () => {
          await fetchPhotos();
          setRemovingPhoto(null);
        }, 500);
      }
    } catch (err) {
      console.error("Error liking photo:", err);
      setRemovingPhoto(null);
    }
  };

  const handleDislike = async (filename: string) => {
    setRemovingPhoto(filename);
    try {
      const response = await fetch(
        `/api/dislikePhoto/${encodeURIComponent(filename)}`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        setTimeout(async () => {
          await fetchPhotos();
          setRemovingPhoto(null);
        }, 500);
      }
    } catch (err) {
      console.error("Error disliking photo:", err);
      setRemovingPhoto(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-2xl text-white">Loading photos...</p>
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

  if (photos.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-2xl text-white">No photos found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <AnimatePresence key={photo} mode="wait">
            {removingPhoto !== photo && (
              <motion.div
                initial={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative w-full"
                style={{ aspectRatio: "1/1" }}
              >
                <Image
                  src={`/api/getPhoto/${encodeURIComponent(photo)}`}
                  alt={photo}
                  fill
                  className="object-cover rounded-lg"
                />
                <div className="absolute bottom-4 right-4 flex gap-6">
                  <button
                    onClick={() => handleDislike(photo)}
                    className="p-2 bg-black/75 rounded-full text-white hover:bg-black/90 transition-colors"
                    aria-label="Dislike photo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleLike(photo)}
                    className="p-2 bg-black/75 rounded-full text-white hover:bg-black/90 transition-colors"
                    aria-label="Like photo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
}
