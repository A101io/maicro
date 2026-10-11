import type { MetadataRoute } from "next";
import { SECTOR_SLUGS } from "@maicro/core/types";

const base = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${base}/`, changeFrequency: "weekly", priority: 1 }, { url: `${base}/prijzen`, changeFrequency: "monthly", priority: 0.9 }, ...SECTOR_SLUGS.map((slug) => ({ url: `${base}/vak/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 }))];
}
