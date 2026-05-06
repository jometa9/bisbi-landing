"use client";

import { useEffect, useState } from "react";

import { User } from "@/lib/db/schema";
import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react";

interface LicenseKeyCardProps {
  user: User;
}

export function LicenseKeyCard({ user }: LicenseKeyCardProps) {
  const [isLicenseVisible, setIsLicenseVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1200);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleLicenseVisibility = () => {
    setIsLicenseVisible((prev) => !prev);
  };

  const copyToClipboard = () => {
    if (!user.apiKey) return;

    navigator.clipboard
      .writeText(user.apiKey)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        setIsCopied(false);
      });
  };

  const getDisplayLicense = () => {
    if (!user.apiKey) return "No License key generated";

    if (!isLicenseVisible) {
      const masked = "•".repeat(user.apiKey.length);
      if (isMobile && masked.length > 10) {
        return masked.substring(0, 25);
      }
      return masked;
    }

    if (isMobile && user.apiKey.length > 10) {
      return user.apiKey.substring(0, 25) + "...";
    }
    return user.apiKey;
  };

  const maskedLicense = getDisplayLicense();

  return (
    <div className="rounded-lg ">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound className="h-5 w-5 " />
        <p className="text-xl ">License</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Use this key to login to your local copier desktop app
      </p>
      <div className="flex items-center gap-3 w-full  bg-gray-50 py-2 px-3 rounded-lg font-mono text-sm cursor-pointer select-text border border-gray-200">
        <div
          className="flex-1 text-gray-600"
          onClick={copyToClipboard}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              copyToClipboard();
            }
          }}
        >
          {maskedLicense}
        </div>
        <div
          onClick={toggleLicenseVisibility}
          title={isLicenseVisible ? "Hide" : "Show"}
          className="flex-shrink-0 cursor-pointer text-gray-600 hover:text-gray-800"
        >
          {isLicenseVisible ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </div>
        <div
          onClick={copyToClipboard}
          disabled={!user.apiKey}
          title="Copy"
          className="flex-shrink-0 cursor-pointer text-gray-600 hover:text-gray-800"
        >
          {isCopied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </div>
      </div>
    </div>
  );
}
