"use client";

import { useEffect, useState } from "react";
import type { Mood, Track } from "@/lib/moods";
import { lookupTrack, platformLinks, trackKey, type TrackInfo } from "@/lib/itunes";
import { usePlayer } from "./PlayerProvider";
import { AppleIcon, PauseIcon, PlayIcon, SpotifyIcon, YoutubeIcon } from "./Icons";
import { Equalizer } from "./Equalizer";

function useTrackInfo(track: Track) {
  const [info, setInfo] = useState<TrackInfo | null>(null);
  useEffect(() => {
    let alive = true;
    lookupTrack(track).then((i) => alive && setInfo(i));
    return () => {
      alive = false;
    };
  }, [track]);
  return info;
}

function TrackRow({ mood, track, index }: { mood: Mood; track: Track; index: number }) {
  const info = useTrackInfo(track);
  const player = usePlayer();
  const active = player.isCurrent(mood, index);
  const loading = player.loadingKey === trackKey(track);
  const links = platformLinks(track, info);
  const [c1] = mood.colors;
  const noPreview = info !== null && !info.previewUrl;

  const onPlay = () => (active ? player.toggle() : player.playMood(mood, index));

  return (
    <li
      className={`group relative flex items-center gap-3 rounded-2xl p-2.5 pr-3 transition duration-300 sm:gap-4 sm:p-3 ${
        active ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
      }`}
      style={active ? { boxShadow: `inset 0 0 0 1px ${c1}55, 0 20px 50px -30px ${c1}` } : undefined}
    >
      <span className="hidden w-6 text-right text-sm tabular-nums text-white/35 sm:block">
        {active && player.playing ? <Equalizer className="h-3.5" /> : index + 1}
      </span>

      <button
        onClick={onPlay}
        disabled={noPreview}
        aria-label={active && player.playing ? `Pause ${track.title}` : `Play preview of ${track.title}`}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/5 sm:h-16 sm:w-16 disabled:cursor-default"
      >
        {info?.artwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={info.artwork} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : info === null ? (
          <span className="skeleton absolute inset-0" />
        ) : (
          <span
            className="absolute inset-0 grid place-items-center text-xl"
            style={{ background: `linear-gradient(135deg, ${mood.colors[1]}, ${mood.colors[2]})` }}
          >
            {mood.emoji}
          </span>
        )}
        {!noPreview && (
          <span
            className={`absolute inset-0 grid place-items-center bg-black/45 text-white backdrop-blur-[2px] transition ${
              active || loading ? "opacity-100" : "opacity-0 group-hover:opacity-100 max-sm:opacity-100 max-sm:bg-black/25"
            }`}
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : active && player.playing ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5" />
            )}
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold tracking-tight sm:text-base" style={active ? { color: c1 } : undefined}>
          {track.title}
        </p>
        <p className="truncate text-[13px] text-white/55 sm:text-sm">
          {track.artist}
          {info?.album && <span className="hidden text-white/30 md:inline"> · {info.album}</span>}
        </p>
        {active && (
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${player.progress * 100}%`, background: c1 }} />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <a
          href={links.apple}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Listen to ${track.title} on Apple Music`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-black transition hover:scale-105 active:scale-95"
        >
          <AppleIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Apple Music</span>
          <span className="sm:hidden">Listen</span>
        </a>
        <a
          href={links.spotify}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Find ${track.title} on Spotify`}
          className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-[#1ed760]"
        >
          <SpotifyIcon className="h-[18px] w-[18px]" />
        </a>
        <a
          href={links.youtube}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Find ${track.title} on YouTube Music`}
          className="hidden h-9 w-9 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-[#ff0033] min-[400px]:grid"
        >
          <YoutubeIcon className="h-[18px] w-[18px]" />
        </a>
      </div>
    </li>
  );
}

export function TrackList({ mood }: { mood: Mood }) {
  return (
    <ol className="flex flex-col gap-1">
      {mood.tracks.map((t, i) => (
        <TrackRow key={trackKey(t)} mood={mood} track={t} index={i} />
      ))}
    </ol>
  );
}
