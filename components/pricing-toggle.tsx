"use client";

import { useState } from "react";

interface PeriodToggleProps {
  isCompact?: boolean;
  isAnnual?: boolean;
  onPeriodChange?: (isAnnual: boolean) => void;
  annualSavingsLabel?: string;
}

export function PeriodToggle({
  isCompact = false,
  isAnnual: isAnnualControlled,
  onPeriodChange,
  annualSavingsLabel,
}: PeriodToggleProps) {
  const [isAnnualUncontrolled, setIsAnnualUncontrolled] = useState(false);

  const isControlled = isAnnualControlled !== undefined && onPeriodChange != null;
  const isAnnual = isControlled ? isAnnualControlled : isAnnualUncontrolled;

  const handleToggleChange = (value: boolean) => {
    if (isControlled) {
      onPeriodChange(value);
    } else {
      setIsAnnualUncontrolled(value);
      document.body.setAttribute(
        "data-billing-period",
        value ? "annual" : "monthly"
      );
    }
  };

  return (
    <div className={`flex gap-2 flex-col ${isCompact ? "" : "items-center"}`}>
      <div
        className={`relative inline-flex items-center  bg-gray-100 rounded-full  border border-gray-100 ${isCompact ? "" : "items-center"}`}
      >
        <button
          type="button"
          onClick={() => handleToggleChange(false)}
          className={`px-3 py-2 rounded-full  font-medium transition-all duration-200 cursor-pointer ${
            !isAnnual
              ? "bg-gray-200 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => handleToggleChange(true)}
          className={`px-3 py-2 rounded-full  font-medium transition-all duration-200 cursor-pointer ${
            isAnnual
              ? "bg-gray-200 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Yearly
        </button>

      </div>
      {annualSavingsLabel && (
        <span className="text-xs font-medium px-2 py-1  text-green-800">
          {annualSavingsLabel}
        </span>
      )}
    </div>
  );
}
