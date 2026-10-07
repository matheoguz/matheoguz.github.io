"use client";

import { useRouter } from "next/navigation";
import { moods } from "@/lib/moods";

export function SurpriseButton({ compact = false, exclude }: { compact?: boolean; exclude?: string }) {
  const router = useRouter();
  const go = () => {
    const pool = moods.filter((m) => m.slug !== exclude);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/mood/${pick.slug}/`);
  };
  return (
    <button
      onClick={go}
      className={
        compact
          ? "group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.03] active:scale-95"
          : "glass group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:bg-white/10 active:scale-95"
      }
    >
      <span className="transition-transform duration-500 group-hover:rotate-180">✦</span>
      Surprise me
    </button>
  );
}
