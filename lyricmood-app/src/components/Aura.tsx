/** Fixed, slowly drifting glow blobs behind every page. Colors follow the --accent vars. */
export function Aura() {
  return (
    <div aria-hidden className="grain pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-1/4 -top-1/4 h-[70vmax] w-[70vmax] rounded-full opacity-40 transition-[background] duration-1000"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)", animation: "drift 38s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 h-[65vmax] w-[65vmax] rounded-full opacity-30 transition-[background] duration-1000"
        style={{ background: "radial-gradient(circle, var(--accent-2) 0%, transparent 65%)", animation: "drift 46s ease-in-out -12s infinite reverse" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--color-ink)_75%)]" />
    </div>
  );
}
