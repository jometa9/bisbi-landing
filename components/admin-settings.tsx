"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function AdminSettings() {
  const [isAssigningSubscription, setIsAssigningSubscription] = useState(false);
  const [subscriptionEmail, setSubscriptionEmail] = useState("");
  const subscriptionProduct = "multi" as const;
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [subscriptionDuration, setSubscriptionDuration] = useState("1");
  const [buttonStatus, setButtonStatus] = useState<"success" | "error" | null>(
    null
  );

  const availablePlans = [
    { value: "none", label: "No Plan (Remove Subscription)" },
    { value: "pro", label: "Pro" },
    { value: "unlimited", label: "Unlimited" },
  ];

  const handleAssignFreeSubscription = async () => {
    try {
      setIsAssigningSubscription(true);
      setButtonStatus(null);

      if (!subscriptionEmail || !subscriptionDuration || !subscriptionProduct) {
        setButtonStatus("error");
        setTimeout(() => setButtonStatus(null), 2000);
        return;
      }

      if (!subscriptionPlan) {
        setButtonStatus("error");
        setTimeout(() => setButtonStatus(null), 2000);
        return;
      }

      const response = await fetch("/api/admin/assign-free-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: subscriptionEmail,
          productKey: subscriptionProduct,
          plan: subscriptionPlan,
          duration: parseInt(subscriptionDuration, 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign free subscription");
      }

      setButtonStatus("success");
      setTimeout(() => setButtonStatus(null), 2000);

      setSubscriptionEmail("");
      setSubscriptionPlan("");
      setSubscriptionDuration("1");
    } catch {
      setButtonStatus("error");
      setTimeout(() => setButtonStatus(null), 2000);
    } finally {
      setIsAssigningSubscription(false);
    }
  };

  return (
    <div className="space-y-3">
        <Input
          id="sub-email"
          placeholder="user@example.com"
          value={subscriptionEmail}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSubscriptionEmail(e.target.value)
          }
          className="shadow-none bg-white"
        />
      <Select value={subscriptionPlan} onValueChange={setSubscriptionPlan}>
        <SelectTrigger>
          <SelectValue placeholder="Select plan" />
        </SelectTrigger>
        <SelectContent>
          {availablePlans.map((plan) => (
            <SelectItem key={plan.value} value={plan.value}>
              {plan.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

        <Select
          value={subscriptionDuration}
          onValueChange={setSubscriptionDuration}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 month</SelectItem>
            <SelectItem value="3">3 months</SelectItem>
            <SelectItem value="6">6 months</SelectItem>
            <SelectItem value="12">1 year</SelectItem>
            <SelectItem value="24">2 years</SelectItem>
            <SelectItem value="1200">100 years</SelectItem>
          </SelectContent>
        </Select>
      <Button
        onClick={handleAssignFreeSubscription}
        disabled={
          isAssigningSubscription ||
          !subscriptionEmail ||
          !subscriptionDuration ||
          !subscriptionProduct ||
          !subscriptionPlan
        }
        className="w-full"
      >
        {isAssigningSubscription
          ? "Assigning..."
          : buttonStatus === "success"
            ? "Success"
            : buttonStatus === "error"
              ? "Error"
              : `Assign ${subscriptionProduct.toUpperCase()} Subscription`}
      </Button>
    </div>
  );
}
