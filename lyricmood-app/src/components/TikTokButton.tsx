import { tiktokUrl } from "@/lib/moods";

export const TikTokIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.37-2.48V9.66a5.68 5.68 0 0 0-.77-.05 5.69 5.69 0 0 0-5.69 5.69A5.69 5.69 0 0 0 9.86 21a5.69 5.69 0 0 0 5.68-5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48Z" />
  </svg>
);

/**
 * "FOLLOW ON TIKTOK" call to action. Renders nothing until the handle is set
 * in `site.tiktok` (src/lib/moods.ts), so the live site never shows a dead link.
 */
export function TikTokButton({ variant = "solid", className = "" }: { variant?: "solid" | "glass" | "compact"; className?: string }) {
  const href = tiktokUrl();
  if (!href) return null;
  const styles = {
    solid:
      "gap-2.5 rounded-full bg-white px-7 py-4 text-sm font-bold tracking-wide text-black shadow-[0_18px_60px_-18px_#ff4d8d] hover:scale-[1.04]",
    glass: "glass gap-2.5 rounded-full px-7 py-4 text-sm font-bold tracking-wide hover:bg-white/10",
    compact: "glass gap-2 rounded-full px-3.5 py-2 text-xs font-bold tracking-wide hover:bg-white/10",
  }[variant];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center transition active:scale-95 ${styles} ${className}`}
    >
      <TikTokIcon className={variant === "compact" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {variant === "compact" ? "FOLLOW" : "FOLLOW ON TIKTOK"}
    </a>
  );
}
