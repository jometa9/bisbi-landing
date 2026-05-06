"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { handleDownload } from "@/lib/download-handler";
import { useI18n } from "@/lib/i18n";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

export function LandingHeader() {
  const { t } = useI18n();
  const { data: session } = useSession();
  const router = useRouter();
  const isLoggedIn = !!session?.user;

  const handleSignInClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      signIn("google", { callbackUrl: "/dashboard" });
    }
  };

  const handleDownloadClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      handleDownload();
    }
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/owl_head.svg" alt="Bisbi" width={24} height={24} />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: "#1A1A18" }}
          >
            bisbi
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={handleSignInClick}
            className="text-sm hidden md:block"
            style={{ color: "#5C5C57" }}
          >
            {t.nav.signIn}
          </button>
          <button
            onClick={handleDownloadClick}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-white"
            style={{ backgroundColor: "#7BA89C" }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = "#5A8C83";
            }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = "#7BA89C";
            }}
          >
            {t.nav.downloadFree}
          </button>
        </div>
      </div>
    </header>
  );
}
