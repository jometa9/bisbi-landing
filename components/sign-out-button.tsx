"use client";

import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.push("/sign-in");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm transition-colors disabled:opacity-50"
      style={{ color: "#A8A8A2" }}
    >
      {loading ? t.dashboard.signingOut : t.dashboard.signOut}
    </button>
  );
}
