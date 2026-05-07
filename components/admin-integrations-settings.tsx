"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface DownloadUrls {
  bisbiWindowsDownloadUrl: string;
  bisbiMacDownloadUrl: string;
  bisbiLinuxDownloadUrl: string;
}

export default function AdminIntegrationsSettings() {
  const [urls, setUrls] = useState<DownloadUrls>({
    bisbiWindowsDownloadUrl: "",
    bisbiMacDownloadUrl: "",
    bisbiLinuxDownloadUrl: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/app-settings");
        if (response.ok) {
          const data = await response.json();
          setUrls({
            bisbiWindowsDownloadUrl: data.bisbiWindowsDownloadUrl || "",
            bisbiMacDownloadUrl: data.bisbiMacDownloadUrl || "",
            bisbiLinuxDownloadUrl: data.bisbiLinuxDownloadUrl || "",
          });
        }
      } catch (error) {
        console.error("Error loading download URLs:", error);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const response = await fetch("/api/admin/app-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(urls),
      });
      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving download URLs:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="windows-download-url">Windows Download URL</Label>
        <Input
          id="windows-download-url"
          type="url"
          placeholder="https://.../Bisbi-Setup.exe"
          value={urls.bisbiWindowsDownloadUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUrls((prev) => ({
              ...prev,
              bisbiWindowsDownloadUrl: e.target.value,
            }))
          }
          className="bg-white shadow-none font-mono text-sm"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="mac-download-url">macOS Download URL</Label>
        <Input
          id="mac-download-url"
          type="url"
          placeholder="https://.../Bisbi.dmg"
          value={urls.bisbiMacDownloadUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUrls((prev) => ({
              ...prev,
              bisbiMacDownloadUrl: e.target.value,
            }))
          }
          className="bg-white shadow-none font-mono text-sm"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="linux-download-url">Linux Download URL</Label>
        <Input
          id="linux-download-url"
          type="url"
          placeholder="https://.../Bisbi.AppImage"
          value={urls.bisbiLinuxDownloadUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUrls((prev) => ({
              ...prev,
              bisbiLinuxDownloadUrl: e.target.value,
            }))
          }
          className="bg-white shadow-none font-mono text-sm"
        />
        <p className="text-xs text-gray-600">
          Update these URLs each time you publish a new release.
        </p>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving
          ? "Saving..."
          : saveStatus === "success"
            ? "Saved!"
            : saveStatus === "error"
              ? "Error"
              : "Save Download URLs"}
      </Button>
    </div>
  );
}
