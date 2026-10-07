import type { Track } from "./moods";

/**
 * Track metadata from Apple's free, public iTunes Search API.
 * We only use what Apple explicitly allows: 30-second previews, artwork
 * and links back to Apple Music. Nothing is hosted on our side.
 * https://performance-partners.apple.com/search-api
 */
export type TrackInfo = {
  previewUrl: string | null;
  appleUrl: string | null;
  artwork: string | null;
  album: string | null;
};

type ItunesResult = {
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  previewUrl?: string;
  trackViewUrl?: string;
  artworkUrl100?: string;
};

const CACHE_PREFIX = "lm:itunes:v1:";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 3; // previews URLs are stable, refresh every 3 days

export const trackKey = (t: Track) => `${t.artist}|${t.title}`.toLowerCase();

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const memory = new Map<string, TrackInfo>();

function readCache(key: string): TrackInfo | undefined {
  const hit = memory.get(key);
  if (hit) return hit;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return undefined;
    const { at, info } = JSON.parse(raw) as { at: number; info: TrackInfo };
    if (Date.now() - at > CACHE_TTL) return undefined;
    memory.set(key, info);
    return info;
  } catch {
    return undefined;
  }
}

function writeCache(key: string, info: TrackInfo) {
  memory.set(key, info);
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: Date.now(), info }));
  } catch {
    /* storage full or blocked — ignore */
  }
}

let jsonpId = 0;

/** The iTunes Search API officially supports JSONP, which avoids any CORS issue. */
function jsonp<T>(url: string, timeoutMs = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const cb = `__lmItunes${++jsonpId}`;
    const script = document.createElement("script");
    const w = window as unknown as Record<string, unknown>;
    const cleanup = () => {
      delete w[cb];
      script.remove();
      clearTimeout(timer);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("timeout"));
    }, timeoutMs);
    w[cb] = (data: T) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("network"));
    };
    script.src = `${url}&callback=${cb}`;
    document.head.appendChild(script);
  });
}

function pickBest(track: Track, results: ItunesResult[]): ItunesResult | undefined {
  const title = norm(track.title);
  const firstArtist = norm(track.artist.split(/&|,| feat\.? | x /i)[0]);
  const scored = results
    .filter((r) => r.trackName && r.artistName)
    .map((r) => {
      const rt = norm(r.trackName!);
      const ra = norm(r.artistName!);
      let score = 0;
      if (ra.includes(firstArtist) || (ra.length >= 3 && firstArtist.includes(ra))) score += 4;
      if (rt === title) score += 4;
      else if (rt.startsWith(title) || title.startsWith(rt)) score += 2;
      if (/karaoke|instrumental|tribute|cover/i.test(`${r.trackName} ${r.collectionName}`)) score -= 5;
      if (r.previewUrl) score += 1;
      return { r, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0] && scored[0].score >= 5 ? scored[0].r : undefined;
}

// Small queue so a mood page never fires 10 requests at the exact same time.
const inflight = new Map<string, Promise<TrackInfo>>();
const MAX_PARALLEL = 3;
let active = 0;
const waiting: (() => void)[] = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_PARALLEL) await new Promise<void>((r) => waiting.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

const EMPTY: TrackInfo = { previewUrl: null, appleUrl: null, artwork: null, album: null };

/** Already-known info for a track, synchronously (lets the player start inside the tap handler). */
export function peekTrack(track: Track): TrackInfo | undefined {
  return readCache(trackKey(track));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function lookupTrack(track: Track): Promise<TrackInfo> {
  const key = trackKey(track);
  const cached = readCache(key);
  if (cached) return Promise.resolve(cached);
  const existing = inflight.get(key);
  if (existing) return existing;

  const p = withSlot(async () => {
    const term = encodeURIComponent(`${track.artist} ${track.title}`);
    const url = `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=10`;
    try {
      // One retry: the free API occasionally rate-limits bursts of requests.
      const data = await jsonp<{ results: ItunesResult[] }>(url).catch(async () => {
        await sleep(1500 + Math.random() * 1000);
        return jsonp<{ results: ItunesResult[] }>(url);
      });
      const best = pickBest(track, data.results ?? []);
      const info: TrackInfo = best
        ? {
            previewUrl: best.previewUrl ?? null,
            appleUrl: best.trackViewUrl ?? null,
            artwork: best.artworkUrl100?.replace(/\/\d+x\d+bb\./, "/600x600bb.") ?? null,
            album: best.collectionName ?? null,
          }
        : EMPTY;
      writeCache(key, info);
      return info;
    } catch {
      return EMPTY; // not cached → retried on next visit
    } finally {
      inflight.delete(key);
    }
  });
  inflight.set(key, p);
  return p;
}

export function platformLinks(track: Track, info?: TrackInfo | null) {
  const q = encodeURIComponent(`${track.title} ${track.artist}`);
  return {
    apple: info?.appleUrl ?? `https://music.apple.com/search?term=${q}`,
    spotify: `https://open.spotify.com/search/${q}`,
    youtube: `https://music.youtube.com/search?q=${q}`,
  };
}
