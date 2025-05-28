"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
  { name: "List Images", path: "/" },
  { name: "Slideshow", path: "/slideshow" },
  { name: "Server Pics", path: "/serverpics" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Burger Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-black/75 rounded-full text-white"
        aria-label="Open menu"
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
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-0 bottom-0 w-64 bg-white/10 backdrop-blur-md z-50 flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-white"
                aria-label="Close menu"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Navigation Links */}
              <div className="flex-1 flex flex-col justify-end pb-20">
                {pages.map((page) => (
                  <Link
                    key={page.path}
                    href={page.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-6 py-4 text-lg text-white hover:bg-white/10 transition-colors ${
                      pathname === page.path ? "bg-white/20" : ""
                    }`}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>

              {/* Close Button at Bottom */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-4 text-white border-t border-white/20"
              >
                Close Menu
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
