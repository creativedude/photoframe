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

  useEffect(() => {
    fetchSettings();
  }, []);

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
    <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-white text-xl mb-4">Select Folder</h2>
        <div className="grid grid-cols-3 gap-4">
          {settings.folders.map((folder, index) => (
            <button
              key={folder}
              onClick={() => handleFolderSelect(folder)}
              className={`p-4 rounded-lg text-white transition-colors ${
                folder === selectedFolder
                  ? "bg-blue-600"
                  : index === selectedIndex
                  ? "bg-gray-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {folder}
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
