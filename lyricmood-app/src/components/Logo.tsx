export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#8b7bff] to-[#ff4d8d] shadow-[0_0_24px_-4px_#8b7bff]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#fff" aria-hidden>
          <rect x="3" y="9" width="2.6" height="6" rx="1.3" />
          <rect x="7.4" y="5" width="2.6" height="14" rx="1.3" />
          <rect x="11.8" y="7.5" width="2.6" height="9" rx="1.3" />
          <rect x="16.2" y="3.5" width="2.6" height="17" rx="1.3" />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight">
        Lyric<span className="font-serif text-[19px] font-normal italic text-white/80">Mood</span>
      </span>
    </span>
  );
}
