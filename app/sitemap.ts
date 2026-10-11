import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sfit-study.ducvu.site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/login", "/register", "/privacy"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "/privacy" ? 0.3 : 0.8,
  }));
}
