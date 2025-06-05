import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

type SettingsObject = {
  folders: string[];
  currentFolder: string;
  displayTime: number;
};

export default function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setSettings(data);
      setSelectedFolder(data.currentFolder);
      setDisplayTime(data.displayTime);
      setError(null);
    } catch (err) {
      setError("Failed to load settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentFolder: selectedFolder,
          displayTime: displayTime,
        }),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      const data = await response.json();
      setSettings((prev) => ({ ...prev, ...data.settings }));
      setError(null);
      onClose();
    } catch (err) {
      setError("Failed to update settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto min-w-[400px] max-w-md rounded bg-gray-900 p-8 border border-gray-700">
          <Dialog.Title className="text-xl font-medium mb-6 text-white">
            Settings
          </Dialog.Title>

          {loading ? (
            <div className="text-center py-6 text-gray-300">Loading...</div>
          ) : error ? (
            <div className="text-red-500 mb-6">{error}</div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Photo Folder
                </label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a folder</option>
                  {settings.folders.map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Display Time (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={displayTime / 1000}
                  onChange={(e) =>
                    setDisplayTime(Number(e.target.value) * 1000)
                  }
                  className="w-full rounded-md border border-gray-700 bg-gray-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-400">
                  How long each photo should be displayed in seconds
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="rounded-md bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
