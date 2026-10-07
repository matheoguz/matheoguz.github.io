"use client";

import type { Mood } from "@/lib/moods";
import { usePlayer } from "./PlayerProvider";
import { PauseIcon, PlayIcon } from "./Icons";

export function PlayMoodButton({ mood }: { mood: Mood }) {
  const player = usePlayer();
  const isThisMood = player.current?.mood.slug === mood.slug;
  const playing = isThisMood && player.playing;
  const loading = !isThisMood && player.loadingKey !== null;
  const [c1, c2] = mood.colors;

  return (
    <button
      onClick={() => (isThisMood ? player.toggle() : player.playMood(mood, 0))}
      className="group relative inline-flex items-center gap-3 rounded-full py-3.5 pl-3.5 pr-7 text-[15px] font-semibold text-black transition hover:scale-[1.03] active:scale-[0.97]"
      style={{ background: `linear-gradient(120deg, #fff, ${c1})`, boxShadow: `0 18px 60px -12px ${c1}` }}
    >
      <span className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ background: c2 }}>
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : playing ? (
          <PauseIcon />
        ) : (
          <PlayIcon className="ml-0.5 h-4 w-4" />
        )}
      </span>
      {playing ? "Pause" : isThisMood ? "Resume" : "Play the mood"}
    </button>
  );
}
