"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

const DEFAULT_FREE_WORD_LIMIT = 2000;

export default function AdminSubscriptionLimits() {
  const [freeMonthlyWordLimit, setFreeMonthlyWordLimit] =
    useState<number>(DEFAULT_FREE_WORD_LIMIT);
  const [originalFreeMonthlyWordLimit, setOriginalFreeMonthlyWordLimit] =
    useState<number>(DEFAULT_FREE_WORD_LIMIT);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonStatus, setButtonStatus] = useState<"success" | "error" | null>(
    null
  );

  useEffect(() => {
    const loadCurrentSettings = async () => {
      try {
        const response = await fetch("/api/admin/app-settings");
        if (response.ok) {
          const data = await response.json();
          const value =
            typeof data.bisbiFreeMonthlyWordLimit === "number"
              ? data.bisbiFreeMonthlyWordLimit
              : DEFAULT_FREE_WORD_LIMIT;
          setFreeMonthlyWordLimit(value);
          setOriginalFreeMonthlyWordLimit(value);
        }
      } catch {}
    };

    loadCurrentSettings();
  }, []);

  const handleUpdateLimits = async () => {
    setIsLoading(true);
    setButtonStatus(null);

    try {
      const response = await fetch("/api/admin/app-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bisbiFreeMonthlyWordLimit: freeMonthlyWordLimit,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setButtonStatus("success");
      setTimeout(() => setButtonStatus(null), 2000);

      setOriginalFreeMonthlyWordLimit(
        typeof data.bisbiFreeMonthlyWordLimit === "number"
          ? data.bisbiFreeMonthlyWordLimit
          : freeMonthlyWordLimit
      );
    } catch {
      setButtonStatus("error");
      setTimeout(() => setButtonStatus(null), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = freeMonthlyWordLimit !== originalFreeMonthlyWordLimit;

  return (
    <div className="space-y-4 h-full justify-between">
      <div className="space-y-1">
        <Label htmlFor="free-word-limit" className="text-xs">
          Free Plan — Monthly Word Limit
        </Label>
        <Input
          id="free-word-limit"
          type="number"
          min={0}
          value={freeMonthlyWordLimit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 0) setFreeMonthlyWordLimit(v);
          }}
          className="shadow-none bg-white"
          placeholder={`${DEFAULT_FREE_WORD_LIMIT}`}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Pro Plan</Label>
        <div
          className="rounded-md border px-3 py-2 text-sm bg-white"
          style={{ borderColor: "#D9E8E5", color: "#5C5C57" }}
        >
          Unlimited words
        </div>
      </div>

      <Button
        onClick={handleUpdateLimits}
        disabled={isLoading || !hasChanges}
        className="w-full"
      >
        {isLoading
          ? "Updating..."
          : buttonStatus === "success"
            ? "Success"
            : buttonStatus === "error"
              ? "Error"
              : "Update Free Word Limit"}
      </Button>
    </div>
  );
}
