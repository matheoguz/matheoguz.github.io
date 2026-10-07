import type { NextConfig } from "next";

// Hosted for free on GitHub Pages at https://matheoguz.github.io/lyricmood
// Set NEXT_PUBLIC_BASE_PATH="" to serve from a domain root (e.g. Vercel / Netlify).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/lyricmood";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
