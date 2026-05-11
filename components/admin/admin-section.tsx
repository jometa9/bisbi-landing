"use client";

import { useI18n } from "@/lib/i18n";
import type { ReactNode } from "react";

type SectionTitleKey =
  | "sectionAssignSubscription"
  | "sectionLimits"
  | "sectionEmailInbox"
  | "sectionStripe"
  | "sectionOpenAI"
  | "sectionDownloads"
  | "sectionDeleteUser";

export function AdminSection({
  icon,
  titleKey,
  children,
}: {
  icon: ReactNode;
  titleKey: SectionTitleKey;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <section>
      <div className="group rounded-lg bg-gray-100 p-3 transition-all duration-200 w-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            {icon}
          </div>
          <p className="text-lg">{t.admin.settings[titleKey]}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
