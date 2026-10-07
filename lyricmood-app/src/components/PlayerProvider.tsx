"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Mood, Track } from "@/lib/moods";
import { lookupTrack, peekTrack, trackKey, type TrackInfo } from "@/lib/itunes";

// 0.05s of silence. Played synchronously inside the first tap so iOS / in-app browsers
// allow the real preview to start after the async lookup.
const SILENCE =
  "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";

type Current = { mood: Mood; index: number; track: Track; info: TrackInfo };

type PlayerState = {
  current: Current | null;
  playing: boolean;
  progress: number; // 0..1
  loadingKey: string | null;
  playMood: (mood: Mood, index?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  isCurrent: (mood: Mood, index: number) => boolean;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<Current | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const requestRef = useRef(0);
  const currentRef = useRef<Current | null>(null);
  currentRef.current = current;

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  const unlockedRef = useRef(false);

  const start = useCallback((audio: HTMLAudioElement, mood: Mood, i: number, track: Track, info: TrackInfo) => {
    setLoadingKey(null);
    setCurrent({ mood, index: i, track, info });
    setProgress(0);
    audio.src = info.previewUrl!;
    audio.play().catch(() => setPlaying(false));
  }, []);

  /** Plays the preview at `index`, skipping forward over tracks without one. */
  const playMood = useCallback(
    async (mood: Mood, index = 0, direction: 1 | -1 = 1) => {
      const req = ++requestRef.current;
      const audio = getAudio();
      const n = mood.tracks.length;
      const at = (k: number) => (index + direction * k + n * 2) % n;

      // Fast path, still inside the user gesture: preview URL already known.
      const known = peekTrack(mood.tracks[at(0)]);
      if (known?.previewUrl) return start(audio, mood, at(0), mood.tracks[at(0)], known);

      if (!unlockedRef.current) {
        unlockedRef.current = true;
        audio.src = SILENCE;
        audio.play().catch(() => {});
      }

      for (let tries = 0; tries < n; tries++) {
        const i = at(tries);
        const track = mood.tracks[i];
        setLoadingKey(trackKey(track));
        const info = await lookupTrack(track);
        if (req !== requestRef.current) return; // a newer click won
        if (!info.previewUrl) continue;
        return start(audio, mood, i, track, info);
      }
      setLoadingKey(null);
    },
    [getAudio, start],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentRef.current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  const next = useCallback(() => {
    const c = currentRef.current;
    if (c) playMood(c.mood, c.index + 1, 1);
  }, [playMood]);

  const prev = useCallback(() => {
    const c = currentRef.current;
    if (c) playMood(c.mood, c.index - 1, -1);
  }, [playMood]);

  const stop = useCallback(() => {
    requestRef.current++;
    audioRef.current?.pause();
    setCurrent(null);
    setPlaying(false);
    setLoadingKey(null);
  }, []);

  useEffect(() => {
    const audio = getAudio();
    const onPlay = () => setPlaying(audio.src !== SILENCE);
    const onPause = () => setPlaying(false);
    const onTime = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    const onEnded = () => {
      if (audio.src !== SILENCE) next();
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [getAudio, next]);

  // Lock-screen / headphone controls on mobile.
  useEffect(() => {
    if (!current || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.track.title,
      artist: current.track.artist,
      album: `LyricMood · ${current.mood.name}`,
      artwork: current.info.artwork ? [{ src: current.info.artwork, sizes: "600x600", type: "image/jpeg" }] : [],
    });
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("previoustrack", prev);
  }, [current, next, prev]);

  const isCurrent = useCallback(
    (mood: Mood, index: number) => current?.mood.slug === mood.slug && current.index === index,
    [current],
  );

  return (
    <PlayerContext.Provider
      value={{
        current,
        playing,
        progress,
        loadingKey,
        playMood: (m, i) => playMood(m, i ?? 0, 1),
        toggle,
        next,
        prev,
        stop,
        isCurrent,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
