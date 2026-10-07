import Link from "next/link";
import type { Mood } from "@/lib/moods";
import { MoodArt } from "./MoodArt";

export function MoodCard({ mood, index = 0, size = "md" }: { mood: Mood; index?: number; size?: "md" | "sm" }) {
  const [c1] = mood.colors;
  return (
    <Link
      href={`/mood/${mood.slug}/`}
      className={`group relative block overflow-hidden rounded-[28px] border border-white/[0.08] bg-ink-2 transition duration-500 hover:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70 ${
        size === "sm" ? "aspect-[4/5] w-44 shrink-0 sm:w-52" : "aspect-[4/5]"
      }`}
      style={{ boxShadow: `0 30px 80px -40px ${c1}` }}
    >
      <div className="absolute inset-0 transition duration-700 group-hover:scale-[1.06]">
        <MoodArt mood={mood} />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${c1}88, inset 0 0 60px -10px ${c1}66` }}
      />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className="h-px w-5 bg-white/30" />
          <span>{mood.tracks.length} songs</span>
        </div>
        <h3 className={`mt-1.5 font-semibold tracking-tight ${size === "sm" ? "text-lg" : "text-xl sm:text-2xl"}`}>
          <span className="mr-1.5">{mood.emoji}</span>
          {mood.name}
        </h3>
        {size === "md" && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-white/60 sm:text-sm">{mood.tagline}</p>
        )}
      </div>
      <span className="absolute right-4 top-4 grid h-9 w-9 translate-y-1 place-items-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-md transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        →
      </span>
    </Link>
  );
}
