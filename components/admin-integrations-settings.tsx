"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";

interface ReleaseFields {
  bisbiAppVersion: string;
  bisbiMacDownloadUrl: string;
  bisbiWindowsDownloadUrl: string;
  bisbiLinuxDownloadUrl: string;
}

export default function AdminIntegrationsSettings() {
  const { t } = useI18n();
  const [fields, setFields] = useState<ReleaseFields>({
    bisbiAppVersion: "",
    bisbiMacDownloadUrl: "",
    bisbiWindowsDownloadUrl: "",
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
          setFields({
            bisbiAppVersion: data.bisbiAppVersion || "",
            bisbiMacDownloadUrl: data.bisbiMacDownloadUrl || "",
            bisbiWindowsDownloadUrl: data.bisbiWindowsDownloadUrl || "",
            bisbiLinuxDownloadUrl: data.bisbiLinuxDownloadUrl || "",
          });
        }
      } catch (error) {
        console.error("Error loading release settings:", error);
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
        body: JSON.stringify(fields),
      });
      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving release settings:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const update = (key: keyof ReleaseFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-3">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="app-version">{t.admin.downloads.version}</Label>
        <Input
          id="app-version"
          type="text"
          placeholder={t.admin.downloads.versionPlaceholder}
          value={fields.bisbiAppVersion}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update("bisbiAppVersion", e.target.value)
          }
          className="bg-white shadow-none font-mono text-sm"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="mac-download-url">{t.admin.downloads.mac}</Label>
        <Input
          id="mac-download-url"
          type="url"
          placeholder="https://.../Bisbi.dmg"
          value={fields.bisbiMacDownloadUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update("bisbiMacDownloadUrl", e.target.value)
          }
          className="bg-white shadow-none font-mono text-sm"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="windows-download-url">{t.admin.downloads.windows}</Label>
        <Input
          id="windows-download-url"
          type="url"
          placeholder="https://.../Bisbi-Setup.exe"
          value={fields.bisbiWindowsDownloadUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update("bisbiWindowsDownloadUrl", e.target.value)
          }
          className="bg-white shadow-none font-mono text-sm"
        />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="linux-download-url">{t.admin.downloads.linux}</Label>
        <Input
          id="linux-download-url"
          type="url"
          placeholder="https://.../Bisbi.AppImage"
          value={fields.bisbiLinuxDownloadUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update("bisbiLinuxDownloadUrl", e.target.value)
          }
          className="bg-white shadow-none font-mono text-sm"
        />
      </div>

      <p className="text-xs text-gray-600">{t.admin.downloads.hint}</p>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving
          ? t.admin.downloads.saveLoading
          : saveStatus === "success"
            ? t.admin.downloads.saveSuccess
            : saveStatus === "error"
              ? t.admin.downloads.saveError
              : t.admin.downloads.save}
      </Button>
    </div>
  );
}
