import React, { useEffect, useState, useCallback } from "react";

interface ServerMenuProps {
  onClose: () => void;
}

type SettingsObject = {
  folders: string[];
  currentFolder: string;
  displayTime: number;
};

export default function ServerMenu({ onClose }: ServerMenuProps) {
  const [settings, setSettings] = useState<SettingsObject>({
    folders: [],
    currentFolder: "",
    displayTime: 30000,
  });
  const [selectedFolder, setSelectedFolder] = useState("");
  const [displayTime, setDisplayTime] = useState(30000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Load preview images for each folder
    settings.folders.forEach((folder) => {
      if (!previewImages[folder]) {
        fetch(`/api/getFirstPhoto/${encodeURIComponent(folder)}`)
          .then((response) => {
            if (response.ok) {
              return response.blob();
            }
            throw new Error("Failed to load preview");
          })
          .then((blob) => {
            const imageUrl = URL.createObjectURL(blob);
            setPreviewImages((prev) => ({
              ...prev,
              [folder]: imageUrl,
            }));
          })
          .catch((err) => {
            console.error(`Failed to load preview for ${folder}:`, err);
          });
      }
    });
  }, [settings.folders]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setSettings(data);
      setSelectedFolder(data.currentFolder);
      setDisplayTime(data.displayTime);
      setSelectedIndex(data.folders.indexOf(data.currentFolder));
      setError(null);
    } catch (err) {
      setError("Failed to load settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const numCols = 3; // Number of columns in the grid
      const numRows = Math.ceil(settings.folders.length / numCols);

      switch (e.key) {
        case "ArrowRight":
          setSelectedIndex((prev) => (prev + 1) % settings.folders.length);
          break;
        case "ArrowLeft":
          setSelectedIndex(
            (prev) =>
              (prev - 1 + settings.folders.length) % settings.folders.length
          );
          break;
        case "ArrowUp":
          setSelectedIndex(
            (prev) =>
              (prev - numCols + settings.folders.length) %
              settings.folders.length
          );
          break;
        case "ArrowDown":
          setSelectedIndex(
            (prev) => (prev + numCols) % settings.folders.length
          );
          break;
        case "Enter":
          handleFolderSelect(settings.folders[selectedIndex]);
          break;
        case "Escape":
          onClose();
          break;
      }
    },
    [settings.folders, selectedIndex, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleFolderSelect = async (folder: string) => {
    try {
      setSaving(true);
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...settings,
          currentFolder: folder,
        }),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      setSelectedFolder(folder);
      window.location.reload();
    } catch (err) {
      setError("Failed to update settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-gray-800/80 p-6 rounded-lg w-auto max-h-[calc(100vh-4rem)] overflow-y-auto">
        <h2 className="text-white text-xl mb-4">Select Folder</h2>
        <div className="grid grid-cols-3 gap-4">
          {settings.folders.map((folder, index) => (
            <button
              key={folder}
              onClick={() => handleFolderSelect(folder)}
              className={[
                "bg-white/50 p-4 rounded-lg text-white transition-all min-w-[200px] h-[100px] relative overflow-hidden",
                folder === selectedFolder && "border-2 border-white",
                index === selectedIndex
                  ? "opacity-100 border-2 border-white"
                  : "opacity-70 hover:opacity-100",
              ].join(" ")}
            >
              {previewImages[folder] && (
                <img
                  src={previewImages[folder]}
                  alt={folder}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 flex items-end h-full ">
                <span className="text-start font-medium">{folder}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 text-white text-sm">
          Use arrow keys to navigate, Enter to select, Esc to close
        </div>
      </div>
    </div>
  );
}
