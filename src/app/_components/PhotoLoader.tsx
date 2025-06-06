"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface PhotoLoaderProps {
  photo: string;
}

export default function PhotoLoader({ photo }: PhotoLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    // Reset states when photo changes
    setIsLoaded(false);
    setIsPortrait(false);
  }, [photo]);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    setIsPortrait(img.naturalHeight > img.naturalWidth);
    setIsLoaded(true);
  };

  return (
    <motion.div
      key={photo}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
    >
      <img
        src={`/api/getPhoto/${encodeURIComponent(photo)}`}
        onLoad={handleImageLoad}
        className={`${
          isPortrait ? "h-full w-auto" : "w-full h-auto"
        } object-contain`}
        style={{ display: isLoaded ? "block" : "none" }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </motion.div>
  );
}
