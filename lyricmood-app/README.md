# LyricMood

> **Your mood. Your music.** — Find the music that matches how you feel.

100% free stack: Next.js 16 (static export) + TypeScript + Tailwind CSS v4, hosted on GitHub Pages.

- Live URL (once merged into `main`): https://matheoguz.github.io/lyricmood/
- One URL per mood, ready for a TikTok bio: `/lyricmood/mood/night-drive/`, `/mood/heartbreak/`, `/mood/gym/`, `/mood/late-night/`…

## How the music works (legal)

Each mood is a hand-picked list of `{ title, artist }` in `src/lib/moods.ts`.
In the visitor's browser, the site asks Apple's free, public **iTunes Search API** for the
official 30-second preview, artwork and Apple Music link. Spotify and YouTube Music buttons are search links.
No audio files and no lyrics are stored or hosted here.

## Edit content

| What | Where |
| --- | --- |
| Moods, songs, descriptions, colors | `src/lib/moods.ts` |
| TikTok handle (shows follow buttons) | `site.tiktok` in `src/lib/moods.ts` |
| Mood illustrations | `src/components/MoodArt.tsx` |
| Home page | `src/app/page.tsx` |
| Mood page | `src/app/mood/[slug]/page.tsx` |

Add a new mood = add one object to `moods` (pick an existing `scene`). Its page and social preview image are generated automatically.

## Commands

```bash
npm install
npm run dev            # http://localhost:3000/lyricmood
npm run publish-site   # build + copy into ../lyricmood (what GitHub Pages serves)
```

Then commit `lyricmood-app/` **and** `lyricmood/` and merge into `main`.

To host at a domain root instead (Vercel/Netlify free tier), build with `NEXT_PUBLIC_BASE_PATH=""`.
