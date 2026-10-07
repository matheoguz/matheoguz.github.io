export function Equalizer({ bars = 4, className = "h-4", active = true }: { bars?: number; className?: string; active?: boolean }) {
  return (
    <span className={`inline-flex items-end gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="eq-bar block h-full w-[3px] rounded-full bg-current"
          style={{
            animationDelay: `${i * 0.18}s`,
            animationDuration: `${0.8 + (i % 3) * 0.2}s`,
            animationPlayState: active ? "running" : "paused",
          }}
        />
      ))}
    </span>
  );
}
