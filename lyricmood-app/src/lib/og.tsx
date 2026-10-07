import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Shared 1200×630 social preview card. No emoji: they would need a network fetch at build time. */
export function ogCard({ kicker, title, subtitle, colors }: { kicker: string; title: string; subtitle: string; colors: [string, string, string] }) {
  const [c1, c2, c3] = colors;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#fff",
          background: `radial-gradient(circle at 85% 15%, ${c1} 0%, transparent 45%), radial-gradient(circle at 10% 110%, ${c2} 0%, transparent 55%), ${c3}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 40 }}>
            {[18, 34, 24, 40].map((h, i) => (
              <div key={i} style={{ width: 8, height: h, borderRadius: 4, background: "#fff" }} />
            ))}
          </div>
          LyricMood
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, letterSpacing: 6, textTransform: "uppercase", opacity: 0.7 }}>{kicker}</div>
          <div style={{ fontSize: title.length > 14 ? 104 : 140, fontWeight: 800, letterSpacing: -6, lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 38, opacity: 0.8, marginTop: 18 }}>{subtitle}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
