"use client";

import { useState, useEffect } from "react";
import Notification from "../_components/Notification";
import FileUploader from "../_components/FileUploader";

export default function UploadPage() {
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("other");
  const [existingFolders, setExistingFolders] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch("/api/folders");
        if (!response.ok) throw new Error("Failed to fetch folders");
        const data = await response.json();
        setExistingFolders(data.folders);
      } catch (error) {
        console.error("Error fetching folders:", error);
        showNotification("Failed to load folders");
      }
    };

    fetchFolders();
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  };

  const handleUploadComplete = () => {
    showNotification("Upload successful!");
    setFolderName("");
    setSelectedFolder("other");
  };

  const handleUploadError = (message: string) => {
    showNotification(message);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 relative">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-red-400 text-3xl font-bold mb-8 text-center">
          Upload Photos
        </h1>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="folderSelect"
              className="block text-sm font-medium mb-2"
            >
              Select Folder
            </label>
            <select
              id="folderSelect"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="other">Create New Folder</option>
              {existingFolders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>

          {selectedFolder === "other" && (
            <div>
              <label
                htmlFor="foldername"
                className="block text-sm font-medium mb-2"
              >
                New Folder Name
              </label>
              <input
                type="text"
                id="foldername"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={selectedFolder === "other"}
              />
            </div>
          )}

          <FileUploader
            folderName={
              selectedFolder === "other" ? folderName : selectedFolder
            }
            onUploadComplete={handleUploadComplete}
            onError={handleUploadError}
          />
        </div>
      </div>
      <Notification message={notification} />
    </main>
  );
}
