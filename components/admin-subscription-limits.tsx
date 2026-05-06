"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

type SubscriptionLimits = {
  free: { accountLimit: number | null; fixedLotSize: number | null };
  pro: { accountLimit: number | null; fixedLotSize: number | null };
  unlimited: { accountLimit: number | null; fixedLotSize: number | null };
};

export default function AdminSubscriptionLimits() {
  const [subscriptionLimits, setSubscriptionLimits] =
    useState<SubscriptionLimits>({
      free: { accountLimit: 1, fixedLotSize: 0.01 },
      pro: { accountLimit: 8, fixedLotSize: null },
      unlimited: { accountLimit: null, fixedLotSize: null },
    });
  const [originalSubscriptionLimits, setOriginalSubscriptionLimits] =
    useState<SubscriptionLimits>({
      free: { accountLimit: 1, fixedLotSize: 0.01 },
      pro: { accountLimit: 8, fixedLotSize: null },
      unlimited: { accountLimit: null, fixedLotSize: null },
    });
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
          const currentLimits = data.subscriptionLimits || {
            free: { accountLimit: 1, fixedLotSize: 0.01 },
            pro: { accountLimit: 8, fixedLotSize: null },
            unlimited: { accountLimit: null, fixedLotSize: null },
          };

          if (!currentLimits.pro) {
            currentLimits.pro = { accountLimit: 8, fixedLotSize: null };
          }

          setSubscriptionLimits(currentLimits);
          setOriginalSubscriptionLimits(currentLimits);
        }
      } catch (error) {
      }
    };

    loadCurrentSettings();
  }, []);

  const handleUpdateLimits = async () => {
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
          appVersion: currentData.appVersion || "1.0.0",
          downloadUrl: currentData.downloadUrl || "",
          subscriptionLimits,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setButtonStatus("success");
      setTimeout(() => setButtonStatus(null), 2000);

      setOriginalSubscriptionLimits(
        data.subscriptionLimits || subscriptionLimits
      );
    } catch (error) {
      setButtonStatus("error");
      setTimeout(() => setButtonStatus(null), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscriptionLimit = (
    plan: keyof SubscriptionLimits,
    field: "accountLimit" | "fixedLotSize",
    value: string
  ) => {
    if (value === "" || value === null || value === undefined) {
      setSubscriptionLimits((prev) => ({
        ...prev,
        [plan]: {
          ...prev[plan],
          [field]: null,
        },
      }));
      return;
    }

    const numValue =
      field === "accountLimit" ? parseInt(value, 10) : parseFloat(value);
    if (isNaN(numValue)) return;

    setSubscriptionLimits((prev) => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [field]: numValue,
      },
    }));
  };

  const hasChanges =
    JSON.stringify(subscriptionLimits) !==
    JSON.stringify(originalSubscriptionLimits);

  return (
    <div className="space-y-3 h-full justify-between">
      {(["free", "pro", "unlimited"] as const).map((plan) => (
        <div key={plan} className="space-y-3 ">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor={`${plan}-account-limit`} className="text-xs">
              {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Account Limit
              </Label>
              <Input
                id={`${plan}-account-limit`}
                type="number"
                value={subscriptionLimits[plan].accountLimit ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateSubscriptionLimit(plan, "accountLimit", e.target.value)
                }
                className="shadow-none bg-white"
                placeholder="null for unlimited"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${plan}-fixed-lot-size`} className="text-xs">
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Fixed Lot Size
              </Label>
              <Input
                id={`${plan}-fixed-lot-size`}
                type="number"
                step="0.01"
                value={subscriptionLimits[plan].fixedLotSize ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateSubscriptionLimit(plan, "fixedLotSize", e.target.value)
                }
                className="shadow-none bg-white"
                placeholder="null for no limit"
              />
            </div>
          </div>
        </div>
      ))}

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
              : "Update Subscription Limits"}
      </Button>
    </div>
  );
}
