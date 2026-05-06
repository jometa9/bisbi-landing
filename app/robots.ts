import { getAppUrl } from "@/lib/app-url";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/admin/",
          "/_next/",
          "/sign-in/",
          "/sign-up/",
          "/forgot-password/",
          "/reset-password/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/admin/",
          "/_next/",
          "/sign-in/",
          "/sign-up/",
          "/forgot-password/",
          "/reset-password/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
