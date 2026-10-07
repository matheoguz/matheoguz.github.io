import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/moods";
import { PlayerProvider } from "@/components/PlayerProvider";
import { Aura } from "@/components/Aura";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MiniPlayer } from "@/components/MiniPlayer";

export const metadata: Metadata = {
  metadataBase: new URL(site.url + "/"),
  title: {
    default: "LyricMood — Your mood. Your music.",
    template: "%s · LyricMood",
  },
  description: site.description,
  applicationName: "LyricMood",
  keywords: ["music by mood", "playlist", "songs for my mood", "night drive songs", "heartbreak songs", "gym music"],
  openGraph: {
    type: "website",
    siteName: "LyricMood",
    title: "LyricMood — Your mood. Your music.",
    description: site.description,
    url: "./",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#05040a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
