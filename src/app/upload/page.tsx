"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Notification from "../_components/Notification";

export default function UploadPage() {
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("other");
  const [existingFolders, setExistingFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalFolderName =
      selectedFolder === "other" ? folderName : selectedFolder;
    if (!finalFolderName || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("folderName", finalFolderName);
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      // Clear form after successful upload
      setFolderName("");
      setSelectedFolder("other");
      setFiles([]);
      showNotification("Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      showNotification("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 relative">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-red-400 text-3xl font-bold mb-8 text-center">
          Upload Photos
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div
            {...getRootProps()}
            className={`h-96 w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-900/20"
                  : "border-gray-700 bg-gray-800/50 hover:bg-gray-800"
              }`}
          >
            <input {...getInputProps()} />
            <div className="h-full flex flex-col items-center justify-center">
              {isDragActive ? (
                <p className="text-lg">Drop the files here ...</p>
              ) : (
                <>
                  <p className="text-lg mb-2">Drag and drop files here</p>
                  <p className="text-sm text-gray-400">
                    or click to select files
                  </p>
                </>
              )}
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Selected files:</h3>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-300 flex justify-between items-center"
                  >
                    <span>{file.name}</span>
                    <span className="text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={
              isUploading ||
              (selectedFolder === "other" && !folderName) ||
              files.length === 0
            }
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
              ${
                isUploading ||
                (selectedFolder === "other" && !folderName) ||
                files.length === 0
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
      <Notification message={notification} />
    </main>
  );
}
