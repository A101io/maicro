import type { MetadataRoute } from "next";

const base = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";

// Reports (/r/...) are private links and also carry noindex; the dashboard,
// API and scan flow are never useful in a search result.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/r/", "/app", "/api/", "/scan/", "/auth/", "/welkom", "/feiten/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
