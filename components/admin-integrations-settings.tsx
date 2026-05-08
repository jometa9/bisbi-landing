"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";

interface DownloadUrls {
  bisbiMacDownloadUrl: string;
}

export default function AdminIntegrationsSettings() {
  const { t } = useI18n();
  const [urls, setUrls] = useState<DownloadUrls>({
    bisbiMacDownloadUrl: "",
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
            bisbiMacDownloadUrl: data.bisbiMacDownloadUrl || "",
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
        <Label htmlFor="mac-download-url">{t.admin.downloads.mac}</Label>
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
