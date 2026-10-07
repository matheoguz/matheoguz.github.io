"use client";

import Link from "next/link";
import { usePlayer } from "./PlayerProvider";
import { AppleIcon, CloseIcon, NextIcon, PauseIcon, PlayIcon } from "./Icons";
import { Equalizer } from "./Equalizer";

export function MiniPlayer() {
  const { current, playing, progress, toggle, next, stop } = usePlayer();
  if (!current) return null;
  const { mood, track, info } = current;
  const [c1] = mood.colors;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6" style={{ animation: "rise .5s cubic-bezier(.2,.7,.1,1) both" }}>
      <div
        className="relative mx-auto flex max-w-2xl items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0e0c18]/90 p-2 pr-2.5 backdrop-blur-xl"
        style={{ boxShadow: `0 20px 60px -20px ${c1}, 0 0 0 1px ${c1}33` }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
          <div className="h-full transition-[width] duration-200" style={{ width: `${progress * 100}%`, background: c1 }} />
        </div>
        <Link href={`/mood/${mood.slug}/`} className="flex min-w-0 flex-1 items-center gap-3">
          {info.artwork && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={info.artwork}
              alt=""
              className={`h-11 w-11 shrink-0 rounded-xl object-cover ${playing ? "animate-[spin_12s_linear_infinite] rounded-full" : ""}`}
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{track.title}</p>
            <p className="flex items-center gap-1.5 truncate text-xs text-white/55">
              <span style={{ color: c1 }}>
                <Equalizer bars={3} className="h-2.5" active={playing} />
              </span>
              {track.artist} · {mood.emoji} {mood.name}
            </p>
          </div>
        </Link>
        {info.appleUrl && (
          <a
            href={info.appleUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open full song in Apple Music"
            className="hidden h-9 items-center gap-1.5 rounded-full border border-white/15 px-3 text-xs font-semibold text-white/85 transition hover:bg-white/10 sm:inline-flex"
          >
            <AppleIcon className="h-3.5 w-3.5" /> Full song
          </a>
        )}
        <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition active:scale-90">
          {playing ? <PauseIcon /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
        </button>
        <button onClick={next} aria-label="Next song" className="grid h-10 w-9 place-items-center rounded-full text-white/80 transition hover:text-white active:scale-90">
          <NextIcon />
        </button>
        <button onClick={stop} aria-label="Close player" className="grid h-10 w-8 place-items-center rounded-full text-white/45 transition hover:text-white active:scale-90">
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
