import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sfit-study.ducvu.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register", "/privacy"],
      disallow: ["/api/", "/exam-attempts/", "/oauth/", "/reset-password", "/verify-email", "/forbidden", "/unauthorized"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
