import Link from "next/link";
import { moods, site } from "@/lib/moods";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.06] px-5 pb-36 pt-14 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
            Your mood. Your music. A free, hand-curated guide to the songs that match how you feel — no account, no
            ads, just press play.
          </p>
          {site.tiktok && (
            <a
              href={`https://www.tiktok.com/@${site.tiktok}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Follow @{site.tiktok} on TikTok
            </a>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Moods</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {moods.map((m) => (
              <li key={m.slug}>
                <Link href={`/mood/${m.slug}/`} className="text-white/60 transition hover:text-white">
                  {m.emoji} {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-white/[0.06] pt-6 text-xs leading-relaxed text-white/35">
        <p>
          Song previews, artwork and links are provided by Apple Music via the iTunes Search API. All music and
          artwork belong to their respective artists and labels. LyricMood does not host any audio files or song
          lyrics.
        </p>
        <p className="mt-2">© {new Date().getFullYear()} LyricMood. Made with late nights and good headphones.</p>
      </div>
    </footer>
  );
}
