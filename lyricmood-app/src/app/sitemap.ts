import type { MetadataRoute } from "next";
import { moods, site } from "@/lib/moods";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    ...moods.map((m) => ({ url: `${site.url}/mood/${m.slug}/`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
