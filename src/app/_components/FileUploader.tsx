import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
  folderName: string;
  onUploadComplete: () => void;
  onError: (message: string) => void;
}

interface UploadProgress {
  [key: string]: {
    progress: number;
    status: "uploading" | "completed" | "error";
  };
}

export default function FileUploader({
  folderName,
  onUploadComplete,
  onError,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isUploading, setIsUploading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    // Initialize progress for new files
    const newProgress = acceptedFiles.reduce((acc, file) => {
      acc[file.name] = { progress: 0, status: "uploading" };
      return acc;
    }, {} as UploadProgress);
    setUploadProgress((prev) => ({ ...prev, ...newProgress }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
  });

  const uploadFile = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("folderName", folderName);
    formData.append("files", file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: { ...prev[file.name], progress },
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: { ...prev[file.name], status: "completed" },
          }));
        } else {
          throw new Error("Upload failed");
        }
      };

      xhr.onerror = () => {
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: { ...prev[file.name], status: "error" },
        }));
        throw new Error("Upload failed");
      };

      xhr.open("POST", "/api/upload");
      xhr.send(formData);

      return new Promise((resolve, reject) => {
        xhr.onloadend = () => {
          if (xhr.status === 200) {
            resolve(true);
          } else {
            reject(new Error("Upload failed"));
          }
        };
      });
    } catch (error) {
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: { ...prev[file.name], status: "error" },
      }));
      throw error;
    }
  };

  const findNextIncompleteFile = (startIndex: number): number | null => {
    for (let i = startIndex; i < files.length; i++) {
      const file = files[i];
      const progress = uploadProgress[file.name];
      if (!progress || progress.status !== "completed") {
        return i;
      }
    }
    return null;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setCurrentFileIndex(0);

    try {
      let currentIndex = 0;
      while (currentIndex < files.length) {
        const file = files[currentIndex];
        const progress = uploadProgress[file.name];

        // Skip completed files
        if (progress?.status === "completed") {
          currentIndex++;
          continue;
        }

        try {
          await uploadFile(file, currentIndex);
          currentIndex++;
        } catch (error) {
          // On error, move to next file
          currentIndex++;
          continue;
        }
      }

      // Check if all files are completed
      const allCompleted = files.every(
        (file) => uploadProgress[file.name]?.status === "completed"
      );

      if (allCompleted) {
        setFiles([]);
        setUploadProgress({});
        onUploadComplete();
      }
    } catch (error) {
      onError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setCurrentFileIndex(null);
    }
  };

  const handleRetry = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const nextIndex = findNextIncompleteFile(0);
    setCurrentFileIndex(nextIndex);

    try {
      let currentIndex = nextIndex;
      while (currentIndex !== null && currentIndex < files.length) {
        const file = files[currentIndex];
        const progress = uploadProgress[file.name];

        // Skip completed files
        if (progress?.status === "completed") {
          currentIndex = findNextIncompleteFile(currentIndex + 1);
          continue;
        }

        try {
          await uploadFile(file, currentIndex);
          currentIndex = findNextIncompleteFile(currentIndex + 1);
        } catch (error) {
          // On error, move to next incomplete file
          if (currentIndex !== null) {
            currentIndex = findNextIncompleteFile(currentIndex + 1);
          }
          continue;
        }
      }

      // Check if all files are completed
      const allCompleted = files.every(
        (file) => uploadProgress[file.name]?.status === "completed"
      );

      if (allCompleted) {
        setFiles([]);
        setUploadProgress({});
        onUploadComplete();
      }
    } catch (error) {
      onError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setCurrentFileIndex(null);
    }
  };

  // Calculate overall progress
  const overallProgress =
    files.length > 0
      ? Math.round(
          Object.values(uploadProgress).reduce(
            (acc, curr) => acc + curr.progress,
            0
          ) / files.length
        )
      : 0;

  // Check if there are any errors
  const hasErrors = Object.values(uploadProgress).some(
    (progress) => progress.status === "error"
  );

  // Check if there are any incomplete files
  const hasIncompleteFiles = files.some(
    (file) =>
      !uploadProgress[file.name] ||
      uploadProgress[file.name].status !== "completed"
  );

  return (
    <div className="space-y-6">
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
              <p className="text-sm text-gray-400">or click to select files</p>
            </>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Overall Progress</h3>
              <span className="text-sm text-gray-400">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  hasErrors ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex justify-between items-center text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <span>File Details</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  showDetails ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDetails && (
              <ul className="mt-4 space-y-4">
                {files.map((file, index) => (
                  <li key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{file.name}</span>
                      <span className="text-sm text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    {uploadProgress[file.name] && (
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            uploadProgress[file.name].status === "error"
                              ? "bg-red-500"
                              : uploadProgress[file.name].status === "completed"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${uploadProgress[file.name].progress}%`,
                          }}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
          className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors
            ${
              isUploading || files.length === 0
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>

        {hasIncompleteFiles && (
          <button
            onClick={handleRetry}
            disabled={isUploading}
            className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors
              ${
                isUploading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
          >
            {isUploading ? "Retrying..." : "Retry Failed"}
          </button>
        )}
      </div>
    </div>
  );
}
