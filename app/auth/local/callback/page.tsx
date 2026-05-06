"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function LocalCallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const deepLinkUrl = `iptrade://ctrader?code=${encodeURIComponent(code || "")}&state=${encodeURIComponent(state || "")}`;

  React.useEffect(() => {
    if (!code) return;
      try {
        window.location.href = deepLinkUrl;
      } catch {
      }
  }, [code, deepLinkUrl]);

  const handleOpenApp = () => {
    try {
      window.location.href = deepLinkUrl;
    } catch {
    }
  };

  if (!code) {
    return (
      <div className="space-y-3 pb-20">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Authorization Error
          </h2>
          <p className="text-xl text-gray-400">
            No authorization code was received
          </p>
        </div>
        <p className="text-sm text-gray-600">
          Please try the authorization process again from the application.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Authorization Successful!
        </h2>
        <p className="text-xl text-gray-400">
          We&apos;ll take you back to the app
        </p>
      </div>
      <div className="flex text-sm items-center space-x-2 text-gray-600">
        Opening the app...
      </div>
      <Button
        onClick={handleOpenApp}
        className="w-full justify-center rounded-lg bg-gray-900 py-3 text-md text-white hover:bg-gray-600"
      >
        Open app
      </Button>
      <p className="text-sm text-gray-600">
        Opening automatically, or click the button above to complete the
        connection.
      </p>
    </div>
  );
}

export default function LocalCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center text-center py-12">
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      }
    >
      <LocalCallbackContent />
    </Suspense>
  );
}
