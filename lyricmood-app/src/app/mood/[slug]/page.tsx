import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMood, moods } from "@/lib/moods";
import { MoodArt } from "@/components/MoodArt";
import { TrackList } from "@/components/TrackList";
import { PlayMoodButton } from "@/components/PlayMoodButton";
import { ShareButton } from "@/components/ShareButton";
import { AccentTheme } from "@/components/AccentTheme";
import { MoodCard } from "@/components/MoodCard";
import { Reveal } from "@/components/Reveal";
import { SurpriseButton } from "@/components/SurpriseButton";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return moods.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const mood = getMood((await params).slug);
  if (!mood) return {};
  const title = `${mood.emoji} ${mood.name} songs`;
  const description = `${mood.tagline} ${mood.tracks.length} hand-picked songs with instant previews — ${mood.tracks
    .slice(0, 3)
    .map((t) => `${t.title} by ${t.artist}`)
    .join(", ")} and more.`;
  return {
    title,
    description,
    alternates: { canonical: `mood/${mood.slug}/` },
    openGraph: { title: `${title} · LyricMood`, description, url: `mood/${mood.slug}/` },
  };
}

export default async function MoodPage({ params }: Props) {
  const mood = getMood((await params).slug);
  if (!mood) notFound();
  const [c1] = mood.colors;
  const others = moods.filter((m) => m.slug !== mood.slug);

  return (
    <>
      <AccentTheme colors={mood.colors} />

      {/* ---------------- HERO ---------------- */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MoodArt mood={mood} intense />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-ink sm:via-black/20" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-end px-5 pb-12 pt-32 sm:min-h-[82svh] sm:px-6 sm:pb-16">
          <Reveal>
            <Link href="/#moods" className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/80 transition hover:text-white">
              ← All moods
            </Link>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Mood playlist · {mood.tracks.length} songs
            </p>
          </Reveal>
          <Reveal delay={180}>
            <h1 className="mt-3 [text-shadow:0_4px_40px_rgb(0_0_0/0.45)] text-[clamp(3.2rem,14vw,8.5rem)] font-extrabold leading-[0.88] tracking-[-0.05em]">
              <span className="mr-3 inline-block align-middle text-[0.6em]">{mood.emoji}</span>
              {mood.name}
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-5 max-w-xl font-serif text-2xl italic leading-snug text-white/85 sm:text-3xl">
              “{mood.caption}”
            </p>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/60 sm:text-base">{mood.description}</p>
          </Reveal>
          <Reveal delay={340} className="mt-8 flex flex-wrap items-center gap-3">
            <PlayMoodButton mood={mood} />
            <ShareButton title={`${mood.name} · LyricMood`} text={`${mood.emoji} ${mood.tagline}`} />
          </Reveal>
        </div>
      </section>

      {/* ---------------- TRACKS ---------------- */}
      <section className="px-3 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="glass rounded-[28px] p-2 sm:p-4" style={{ boxShadow: `0 40px 120px -60px ${c1}` }}>
            <div className="flex items-center justify-between px-3 pb-3 pt-3 sm:px-4">
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">The selection</h2>
              <p className="text-xs text-white/40">Tap a cover for a 30s preview</p>
            </div>
            <TrackList mood={mood} />
          </div>
          <p className="mt-4 px-2 text-center text-[11px] text-white/30">
            Previews courtesy of Apple Music. Full songs open on your favorite platform.
          </p>
        </div>
      </section>

      {/* ---------------- OTHER MOODS ---------------- */}
      <section className="pt-24">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">Not quite it?</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] sm:text-5xl">
              Switch the <span className="font-serif font-normal italic">mood</span>
            </h2>
          </div>
          <div className="hidden sm:block">
            <SurpriseButton exclude={mood.slug} />
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:gap-4 sm:px-6 [&::-webkit-scrollbar]:hidden">
            {others.map((m) => (
              <div key={m.slug} className="snap-start">
                <MoodCard mood={m} index={moods.indexOf(m)} size="sm" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-center sm:hidden">
          <SurpriseButton exclude={mood.slug} />
        </div>
      </section>
    </>
  );
}
