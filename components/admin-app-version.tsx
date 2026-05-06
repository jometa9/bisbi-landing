"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface AppSettingsState {
  multi: {
    version: string;
    windowsDownloadUrl: string;
    macDownloadUrl: string;
  };
}

export default function AdminAppVersion() {
  const [settings, setSettings] = useState<AppSettingsState>({
    multi: {
      version: "",
      windowsDownloadUrl: "",
      macDownloadUrl: "",
    },
  });
  const [originalSettings, setOriginalSettings] = useState<AppSettingsState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonStatus, setButtonStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    const loadCurrentSettings = async () => {
      try {
        const response = await fetch("/api/admin/app-settings");
        if (response.ok) {
          const data = await response.json();
          const newSettings: AppSettingsState = {
            multi: {
              version: data.multiVersion || "1.0.0",
              windowsDownloadUrl: data.multiWindowsDownloadUrl || "",
              macDownloadUrl: data.multiMacDownloadUrl || "",
            },
          };
          setSettings(newSettings);
          setOriginalSettings(newSettings);
        }
      } catch {
      }
    };

    loadCurrentSettings();
  }, []);

  const handleUpdateSettings = async () => {
    setIsLoading(true);
    setButtonStatus(null);

    try {
      const getResponse = await fetch("/api/admin/app-settings");
      const currentData = await getResponse.json();

      const response = await fetch("/api/admin/app-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          multiVersion: settings.multi.version.trim(),
          multiWindowsDownloadUrl: settings.multi.windowsDownloadUrl.trim(),
          multiMacDownloadUrl: settings.multi.macDownloadUrl.trim(),
          subscriptionLimits: currentData.subscriptionLimits,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setButtonStatus("success");
      setTimeout(() => setButtonStatus(null), 2000);
      setOriginalSettings(settings);
    } catch {
      setButtonStatus("error");
      setTimeout(() => setButtonStatus(null), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = originalSettings && JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const updateSetting = (
    field: "version" | "windowsDownloadUrl" | "macDownloadUrl",
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      multi: {
        ...prev.multi,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="multi-version" className="text-xs">IPTRADE Multi Version</Label>
            <Input
              id="multi-version"
              placeholder="1.0.0"
              value={settings.multi.version}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting("version", e.target.value)}
              className="shadow-none bg-white text-sm"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="multi-win-url" className="text-xs">Multi Windows Download URL</Label>
            <Input
              id="multi-win-url"
              placeholder="https://..."
              value={settings.multi.windowsDownloadUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting("windowsDownloadUrl", e.target.value)}
              className="shadow-none bg-white text-sm"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="multi-mac-url" className="text-xs">Multi macOS Download URL</Label>
            <Input
              id="multi-mac-url"
              placeholder="https://..."
              value={settings.multi.macDownloadUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting("macDownloadUrl", e.target.value)}
              className="shadow-none bg-white text-sm"
            />
          </div>
        </div>

      <Button
        onClick={handleUpdateSettings}
        disabled={isLoading || !hasChanges}
        className="w-full"
      >
        {isLoading
          ? "Updating..."
          : buttonStatus === "success"
            ? "Success"
            : buttonStatus === "error"
              ? "Error"
              : "Update App Settings"}
      </Button>
    </div>
  );
}
