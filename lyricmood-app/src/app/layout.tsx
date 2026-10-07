import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/moods";
import { PlayerProvider } from "@/components/PlayerProvider";
import { Aura } from "@/components/Aura";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MiniPlayer } from "@/components/MiniPlayer";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(site.url + "/"),
  title: {
    default: "LyricMood — Your mood. Your music.",
    template: "%s — LyricMood",
  },
  description: site.description,
  applicationName: "LyricMood",
  keywords: ["music by mood", "playlist", "songs for my mood", "night drive songs", "heartbreak songs", "gym music", "late night songs"],
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: "LyricMood",
    title: "LyricMood — Your mood. Your music.",
    description: site.description,
    url: "./",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LyricMood — Your mood. Your music.",
    description: site.description,
  },
  // Explicit basePath: Next.js 16 forgets it for generated apple-icon routes.
  icons: {
    icon: [{ url: `${base}/icon.svg`, type: "image/svg+xml" }],
    apple: [{ url: `${base}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { title: "LyricMood", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#05040a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint, so scroll reveals never hide content without JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh">
        <PlayerProvider>
          <Aura />
          <Header />
          <main>{children}</main>
          <Footer />
          <MiniPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
