"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { SurpriseButton } from "./SurpriseButton";
import { TikTokButton } from "./TikTokButton";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-3 sm:px-6">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-3 py-2 transition-all duration-500 sm:px-4 ${
          scrolled ? "glass shadow-[0_10px_40px_-20px_rgb(0_0_0/0.8)]" : "border border-transparent"
        }`}
      >
        <Link href="/" aria-label="LyricMood home" className="rounded-xl focus-visible:outline-2 focus-visible:outline-white/60">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/#moods" className="hidden rounded-full px-4 py-2 text-white/70 transition hover:text-white sm:block">
            Moods
          </Link>
          <TikTokButton variant="compact" className="mr-1" />
          <SurpriseButton compact />
        </nav>
      </div>
    </header>
  );
}
