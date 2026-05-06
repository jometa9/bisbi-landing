"use client";

import { useMetaPixel } from "@/components/meta-pixel";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface CTAButtonProps {
  href: string;
  variant?: "primary" | "secondary";
  children?: React.ReactNode;
  product?: string;
  eventType?: "cta_click" | "pricing_click" | "trial_click";
  className?: string;
}

export function CTAButton({
  href,
  variant = "primary",
  children,
  product,
  eventType = "cta_click",
  className,
}: CTAButtonProps) {
  const { trackCustomEvent, trackLead } = useMetaPixel();

  const handleClick = () => {
    trackCustomEvent(eventType, {
      content_name: product || "landing_page",
      button_text: typeof children === "string" ? children : "CTA",
      destination: href,
    });

    if (href.includes("sign-up") || href.includes("trial")) {
      trackLead({
        content_name: product || "landing_page",
        content_category: "trial_signup",
      });
    }
  };

  const baseClasses =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-3 rounded-full bg-gray-900 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-gray-700 transition-all"
      : "inline-flex items-center justify-center gap-3 rounded-full border-2 border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-all";

  return (
    <Link href={href} className={className || baseClasses} onClick={handleClick}>
      {children || "Get Started"}
      {variant === "primary" && <ArrowRight className="w-5 h-5" />}
    </Link>
  );
}

interface LandingPageTrackerProps {
  pageName: string;
  product: string;
}

export function LandingPageTracker({ pageName, product }: LandingPageTrackerProps) {
  const { trackViewContent } = useMetaPixel();

  useEffect(() => {
    trackViewContent({
      content_name: pageName,
      content_category: product,
    });
  }, [pageName, product, trackViewContent]);

  return null;
}

