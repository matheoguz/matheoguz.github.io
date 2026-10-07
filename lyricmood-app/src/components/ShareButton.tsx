"use client";

import { useState } from "react";
import { ShareIcon } from "./Icons";

export function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <button
      onClick={share}
      className="glass inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition hover:bg-white/10 active:scale-95"
    >
      <ShareIcon />
      {copied ? "Link copied ✓" : "Share"}
    </button>
  );
}
