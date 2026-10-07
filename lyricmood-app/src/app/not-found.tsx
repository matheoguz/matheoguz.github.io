import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-6 pt-24 text-center">
      <p className="font-serif text-7xl italic text-white/20">404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">This mood doesn&apos;t exist… yet.</h1>
      <p className="mt-4 max-w-sm text-white/55">But we&apos;ve got ten others that probably fit how you feel.</p>
      <Link href="/#moods" className="mt-8 rounded-full bg-white px-7 py-4 text-sm font-bold tracking-wide text-black transition hover:scale-105">
        FIND YOUR MOOD →
      </Link>
    </section>
  );
}
