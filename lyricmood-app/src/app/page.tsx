import Link from "next/link";
import { moods, site } from "@/lib/moods";
import { MoodCard } from "@/components/MoodCard";
import { MoodArt } from "@/components/MoodArt";
import { Reveal } from "@/components/Reveal";
import { SurpriseButton } from "@/components/SurpriseButton";
import { Equalizer } from "@/components/Equalizer";

const heroMoods = ["heartbreak", "late-night", "night-drive"].map((s) => moods.find((m) => m.slug === s)!);

export default function Home() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-16 pt-28 text-center sm:px-6">
        {/* floating cards */}
        <div aria-hidden className="pointer-events-none absolute inset-0 mx-auto max-w-6xl">
          {heroMoods.map((m, i) => (
            <div
              key={m.slug}
              className={`absolute aspect-[4/5] w-28 overflow-hidden rounded-3xl border border-white/10 opacity-60 sm:w-40 sm:opacity-80 lg:w-52 ${
                ["left-[-6%] top-[14%] -rotate-12 sm:left-[4%]", "right-[-8%] top-[22%] rotate-[10deg] sm:right-[6%]", "bottom-[3%] left-[2%] rotate-6 hidden sm:block lg:left-[4%]"][i]
              }`}
              style={{ animation: `float ${10 + i * 2}s ease-in-out ${-i * 3}s infinite`, boxShadow: `0 40px 100px -30px ${m.colors[0]}` }}
            >
              <MoodArt mood={m} />
            </div>
          ))}
        </div>

        <div className="relative">
          <Reveal>
            <span className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-medium text-white/75 sm:text-[13px]">
              <span className="text-[#8b7bff]">
                <Equalizer bars={4} className="h-3" />
              </span>
              Free · No account · {moods.length} moods
            </span>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-7 text-[clamp(3.2rem,15vw,9.5rem)] font-extrabold leading-[0.86] tracking-[-0.055em]">
              <span className="block">YOUR MOOD.</span>
              <span className="block">
                YOUR{" "}
                <span className="text-gradient pr-2 font-serif font-normal italic tracking-[-0.02em]">MUSIC.</span>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={260}>
            <p className="mx-auto mt-6 max-w-md text-lg text-white/65 sm:text-xl">
              Find the music that matches how you feel.
            </p>
          </Reveal>

          <Reveal delay={380} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#moods"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-[15px] font-bold tracking-wide text-black shadow-[0_20px_70px_-15px_#8b7bff] transition hover:scale-[1.04] active:scale-[0.97]"
            >
              <span className="absolute inset-0 -z-0 bg-gradient-to-r from-[#c4b8ff] via-white to-[#ffc2da] opacity-0 transition duration-500 group-hover:opacity-100" />
              <span className="relative">FIND YOUR MOOD</span>
              <span className="relative transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <SurpriseButton />
          </Reveal>
        </div>

        <a href="#moods" aria-label="Scroll to moods" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/35 sm:flex">
          Scroll
          <span className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </a>
      </section>

      {/* ---------------- MARQUEE ---------------- */}
      <div aria-hidden className="relative overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-5 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max gap-10 whitespace-nowrap text-2xl font-semibold tracking-tight text-white/25 sm:text-3xl" style={{ animation: "marquee 40s linear infinite" }}>
          {[...moods, ...moods].map((m, i) => (
            <span key={i} className="flex items-center gap-10">
              <span>
                {m.emoji} <span className={i % 2 ? "font-serif font-normal italic" : ""}>{m.name}</span>
              </span>
              <span className="text-white/15">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------------- MOODS ---------------- */}
      <section id="moods" className="scroll-mt-20 px-4 pt-24 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">Step 1 — Pick one</p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.035em] sm:text-6xl">
                How are you <span className="font-serif font-normal italic text-white/80">feeling</span>
                <br className="hidden sm:block" /> right now?
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              Every mood is a hand-picked selection of songs with instant 30-second previews.
            </p>
          </Reveal>

          <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
            {moods.map((m, i) => (
              <Reveal as="li" key={m.slug} delay={(i % 5) * 70}>
                <MoodCard mood={m} index={i} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="px-4 pt-28 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">How it works</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
              Three seconds from <span className="font-serif font-normal italic text-gradient">feeling</span> to playing.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-3 sm:gap-5">
            {[
              { n: "01", t: "Pick your mood", d: "Late night overthinking? Gym rage? Heartbreak? Choose what you feel — no sign-up." },
              { n: "02", t: "Preview instantly", d: "Tap any song to hear a 30-second preview right here. Hit “Play the mood” to let it flow." },
              { n: "03", t: "Take it with you", d: "Open the full song on Apple Music, Spotify or YouTube Music in one tap." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 100} className="glass group relative overflow-hidden rounded-3xl p-6 sm:p-7">
                <span className="font-serif text-5xl italic text-white/20 transition group-hover:text-[#8b7bff]">{s.n}</span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="px-4 pt-28 sm:px-6 sm:pt-36">
        <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-white/10 px-6 py-16 text-center sm:px-12 sm:py-24">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_120%,#8b7bff55,transparent_60%),radial-gradient(ellipse_at_10%_-20%,#ff4d8d40,transparent_55%)]" />
          <p className="font-serif text-2xl italic text-white/60 sm:text-3xl">Feeling something?</p>
          <h2 className="mt-2 text-4xl font-extrabold tracking-[-0.04em] sm:text-7xl">There&apos;s a song for that.</h2>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="#moods" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold tracking-wide text-black transition hover:scale-105 active:scale-95">
              FIND YOUR MOOD →
            </Link>
            {site.tiktok && (
              <a href={`https://www.tiktok.com/@${site.tiktok}`} target="_blank" rel="noopener noreferrer" className="glass inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold transition hover:bg-white/10">
                New moods daily on TikTok
              </a>
            )}
          </div>
        </Reveal>
      </section>
    </>
  );
}
