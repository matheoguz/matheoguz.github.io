import { getMood, moods } from "@/lib/moods";
import { ogCard, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const dynamicParams = false;
export const alt = "LyricMood mood playlist";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return moods.map((m) => ({ slug: m.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const mood = getMood((await params).slug)!;
  return ogCard({
    kicker: `${mood.tracks.length} songs for your mood`,
    title: mood.name,
    subtitle: mood.tagline,
    colors: mood.colors,
  });
}
