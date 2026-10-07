import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LyricMood — Your mood. Your music.",
    short_name: "LyricMood",
    description: "Find the music that matches how you feel.",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#05040a",
    theme_color: "#05040a",
    icons: [
      { src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml" },
      { src: `${base}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
    ],
  };
}
