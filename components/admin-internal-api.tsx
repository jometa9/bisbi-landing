"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export default function AdminInternalApi() {
  const [internalApiKey, setInternalApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/app-settings");
      if (response.ok) {
        const data = await response.json();
        setInternalApiKey(data.internalApiKey || "");
      }
    } catch (error) {
      console.error("Error loading internal API key:", error);
    }
  };

  const persist = async (value: string) => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const response = await fetch("/api/admin/app-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalApiKey: value }),
      });
      if (response.ok) {
        const data = await response.json();
        setInternalApiKey(data.internalApiKey || "");
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 2000);
      }
    } catch (error) {
      console.error("Error saving internal API key:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    await persist(internalApiKey);
  };

  const handleRegenerate = async () => {
    const random =
      "iptrade_int_" +
      Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    setInternalApiKey(random);
    await persist(random);
  };

  const handleCopy = async () => {
    if (!internalApiKey) return;
    try {
      await navigator.clipboard.writeText(internalApiKey);
    } catch (error) {
      console.error("Clipboard write failed:", error);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Used to authenticate calls to{" "}
        <code className="text-xs bg-gray-200 px-1 rounded">
          /api/internal/v1/...
        </code>{" "}
        via the <code className="text-xs bg-gray-200 px-1 rounded">x-internal-api-key</code>{" "}
        header. Treat it like a password.
      </p>

      <div className="space-y-1">
        <Label htmlFor="internal-api-key">Internal API key</Label>
        <div className="flex gap-2">
          <Input
            id="internal-api-key"
            type={showKey ? "text" : "password"}
            value={internalApiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInternalApiKey(e.target.value)
            }
            placeholder="iptrade_int_..."
            className="shadow-none bg-white font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowKey((v) => !v)}
          >
            {showKey ? "Hide" : "Show"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCopy}>
            Copy
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving
            ? "Saving..."
            : saveStatus === "success"
              ? "Saved"
              : saveStatus === "error"
                ? "Error"
                : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleRegenerate}
          disabled={isSaving}
        >
          Regenerate
        </Button>
      </div>
    </div>
  );
}
