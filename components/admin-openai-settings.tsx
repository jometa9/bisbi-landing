"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";

interface OpenAISettings {
  openaiApiKey: string;
}

export default function AdminOpenAISettings() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<OpenAISettings>({ openaiApiKey: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/app-settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({ openaiApiKey: data.openaiApiKey || "" });
        }
      } catch (error) {
        console.error("Error loading OpenAI settings:", error);
      }
    })();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const response = await fetch("/api/admin/app-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openaiApiKey: settings.openaiApiKey }),
      });
      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving OpenAI settings:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="openai-api-key">{t.admin.openaiSettings.apiKey}</Label>
        <div className="flex gap-3">
          <Input
            id="openai-api-key"
            type={showKey ? "text" : "password"}
            placeholder="sk-..."
            value={settings.openaiApiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSettings({ openaiApiKey: e.target.value })
            }
            className="bg-white shadow-none font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowKey(!showKey)}
            className="shadow-none whitespace-nowrap"
          >
            {showKey ? t.admin.openaiSettings.hide : t.admin.openaiSettings.show}
          </Button>
        </div>
        <p className="text-xs text-gray-600">{t.admin.openaiSettings.apiKeyHint}</p>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving
          ? t.admin.openaiSettings.saveLoading
          : saveStatus === "success"
            ? t.admin.openaiSettings.saveSuccess
            : saveStatus === "error"
              ? t.admin.openaiSettings.saveError
              : t.admin.openaiSettings.save}
      </Button>
    </div>
  );
}
