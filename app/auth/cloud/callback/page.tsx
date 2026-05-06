"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function CloudCallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const [copied, setCopied] = React.useState<boolean>(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
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
          {error
            ? `${error}${errorDescription ? `: ${errorDescription}` : ""}`
            : "Please try the authorization process again."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Authorization Successful
        </h2>
        <p className="text-xl text-gray-400">
          Copy these values to use in your API
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="break-all font-mono text-sm text-gray-800">{code}</p>
      </div>

      <Button
        onClick={copyCode}
        className="w-full justify-center rounded-lg bg-gray-900 py-3 text-md text-white hover:bg-gray-600"
      >
        {copied ? "Code copied" : "Copy code"}
      </Button>
    </div>
  );
}

export default function CloudCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center text-center py-12">
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      }
    >
      <CloudCallbackContent />
    </Suspense>
  );
}
