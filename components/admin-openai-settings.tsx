"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface OpenAISettings {
  openaiApiKey: string;
  openaiModel: string;
}

export default function AdminOpenAISettings() {
  const [settings, setSettings] = useState<OpenAISettings>({
    openaiApiKey: "",
    openaiModel: "gpt-4o",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/app-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({
          openaiApiKey: data.openaiApiKey || "",
          openaiModel: data.openaiModel || "gpt-4o",
        });
      }
    } catch (error) {
      console.error("Error loading OpenAI settings:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch("/api/admin/app-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openaiApiKey: settings.openaiApiKey,
          openaiModel: settings.openaiModel,
        }),
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
        <Label htmlFor="openai-api-key">OpenAI API Key</Label>
        <div className="flex gap-3">
          <Input
            id="openai-api-key"
            type={showApiKey ? "text" : "password"}
            placeholder="sk-proj-..."
            value={settings.openaiApiKey}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, openaiApiKey: e.target.value }))
            }
            className="bg-white shadow-none font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowApiKey(!showApiKey)}
            className="shadow-none whitespace-nowrap"
          >
            {showApiKey ? "Hide" : "Show"}
          </Button>
        </div>
        <p className="text-xs text-gray-600">
          OpenAI API key. Required for the chat to work.
        </p>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="openai-model">Model</Label>
        <Input
          id="openai-model"
          type="text"
          placeholder="gpt-4o"
          value={settings.openaiModel}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, openaiModel: e.target.value }))
          }
          className="bg-white shadow-none font-mono text-sm"
        />
        <p className="text-xs text-gray-600">
          E.g. gpt-4o, gpt-4o-mini, gpt-3.5-turbo. Defaults to gpt-4o when empty.
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving
          ? "Saving..."
          : saveStatus === "success"
            ? "Saved"
            : saveStatus === "error"
              ? "Error"
              : "Save Settings"}
      </Button>
    </div>
  );
}
