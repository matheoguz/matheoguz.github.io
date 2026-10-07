import { ogCard, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const alt = "LyricMood — Your mood. Your music.";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    kicker: "Find the music that matches how you feel",
    title: "YOUR MOOD. YOUR MUSIC.",
    subtitle: "10 moods · instant previews · free",
    colors: ["#8b7bff", "#ff4d8d", "#05040a"],
  });
}
