import { useId } from "react";
import type { Mood } from "@/lib/moods";

/** Deterministic pseudo-random numbers so server and client render the same art. */
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Stars({ count, seed, maxY = 500, color = "#fff" }: { count: number; seed: number; maxY?: number; color?: string }) {
  const r = rand(seed);
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => {
        const size = r() * 1.6 + 0.4;
        return (
          <circle
            key={i}
            cx={r() * 400}
            cy={r() * maxY}
            r={size}
            style={{ animation: `twinkle ${2 + r() * 4}s ease-in-out ${r() * 4}s infinite` }}
          />
        );
      })}
    </g>
  );
}

function Skyline({ seed, color, y = 430 }: { seed: number; color: string; y?: number }) {
  const r = rand(seed);
  const buildings: React.ReactNode[] = [];
  const windows: React.ReactNode[] = [];
  let x = -10;
  let i = 0;
  while (x < 410) {
    const w = 18 + r() * 34;
    const h = 40 + r() * 120;
    buildings.push(<rect key={i} x={x} y={y - h} width={w} height={h + 80} />);
    for (let wy = y - h + 10; wy < y; wy += 14) {
      for (let wx = x + 5; wx < x + w - 6; wx += 9) {
        if (r() > 0.78) windows.push(<rect key={`${i}-${wx}-${wy}`} x={wx} y={wy} width={3} height={5} />);
      }
    }
    x += w + 2;
    i++;
  }
  return (
    <g>
      <g fill={color}>{buildings}</g>
      <g fill="#ffd98a" opacity={0.7}>
        {windows}
      </g>
    </g>
  );
}

export function MoodArt({ mood, className = "", intense = false }: { mood: Mood; className?: string; intense?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const [c1, c2, c3] = mood.colors;
  const id = (n: string) => `${n}-${uid}`;

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label={`${mood.name} illustration`}
    >
      <defs>
        <linearGradient id={id("bg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c3} />
          <stop offset="0.55" stopColor={c2} stopOpacity={0.55} />
          <stop offset="1" stopColor={c3} />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={c1} stopOpacity={0.9} />
          <stop offset="0.4" stopColor={c1} stopOpacity={0.35} />
          <stop offset="1" stopColor={c1} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={id("fade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.5" stopColor={c3} stopOpacity={0} />
          <stop offset="1" stopColor={c3} stopOpacity={0.95} />
        </linearGradient>
        <linearGradient id={id("sun")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.5" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <filter id={id("blur")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <clipPath id={id("upper")}>
          <rect x="0" y="0" width="400" height="300" />
        </clipPath>
      </defs>

      <rect width="400" height="500" fill={`url(#${id("bg")})`} />

      {mood.scene === "moon" && (
        <g>
          <Stars count={70} seed={7} maxY={330} />
          <circle cx="270" cy="150" r="140" fill={`url(#${id("glow")})`} />
          <g style={{ animation: "float 12s ease-in-out infinite", transformOrigin: "270px 150px" }}>
            <circle cx="270" cy="150" r="58" fill="#f2efff" />
            <circle cx="298" cy="132" r="54" fill={c3} />
          </g>
          <Skyline seed={3} color="#06051a" />
        </g>
      )}

      {mood.scene === "heart" && (
        <g>
          <Stars count={30} seed={11} color={c1} />
          <circle cx="200" cy="230" r="170" fill={`url(#${id("glow")})`} />
          <g style={{ animation: "float 10s ease-in-out infinite", transformOrigin: "200px 240px" }}>
            <path
              d="M200 330 L120 250 C80 210 95 150 145 145 C170 143 190 158 200 178 L188 215 L210 240 L192 275 Z"
              fill={c1}
              transform="translate(-10 0) rotate(-6 200 240)"
            />
            <path
              d="M200 178 C210 158 230 143 255 145 C305 150 320 210 280 250 L200 330 L192 275 L210 240 L188 215 Z"
              fill={c2}
              transform="translate(12 6) rotate(7 200 240)"
            />
          </g>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={150 + i * 28}
              y={360 + (i % 2) * 20}
              width={6}
              height={10}
              fill={c1}
              opacity={0.6}
              transform={`rotate(${i * 37} ${150 + i * 28} ${360})`}
            />
          ))}
        </g>
      )}

      {mood.scene === "love" && (
        <g>
          <circle cx="200" cy="240" r="180" fill={`url(#${id("glow")})`} />
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx="200"
              cy="240"
              r="90"
              fill="none"
              stroke={c1}
              strokeWidth="1.5"
              style={{
                transformOrigin: "200px 240px",
                animation: `pulse-ring 3.6s ease-out ${i * 1.2}s infinite`,
              }}
            />
          ))}
          <g style={{ transformOrigin: "200px 240px", animation: "beat 1.6s ease-in-out infinite" }}>
            <path
              d="M200 320 C120 260 90 220 110 180 C130 140 180 145 200 185 C220 145 270 140 290 180 C310 220 280 260 200 320 Z"
              fill={c1}
            />
            <path
              d="M150 175 C140 180 132 192 134 205"
              stroke="#fff"
              strokeOpacity="0.6"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          </g>
          <Stars count={25} seed={5} color="#ffd1e3" />
        </g>
      )}

      {mood.scene === "pulse" && (
        <g>
          <circle cx="200" cy="200" r="190" fill={`url(#${id("glow")})`} opacity={0.6} />
          <g transform="translate(40 120)">
            {Array.from({ length: 16 }, (_, i) => (
              <rect
                key={i}
                className="eq-bar"
                x={i * 20}
                y={0}
                width={12}
                height={200}
                rx={6}
                fill={i % 3 === 0 ? c1 : c2}
                style={{ animationDelay: `${(i * 0.13) % 1.1}s`, animationDuration: `${0.6 + ((i * 7) % 5) / 10}s` }}
              />
            ))}
          </g>
          <path
            d="M0 400 L120 400 L140 360 L160 440 L180 330 L200 470 L220 400 L400 400"
            fill="none"
            stroke={c1}
            strokeWidth="4"
            strokeLinejoin="round"
            strokeDasharray="300 300"
            style={{ animation: "heartbeat-line 2.4s linear infinite" }}
          />
        </g>
      )}

      {mood.scene === "road" && (
        <g>
          <Stars count={50} seed={9} maxY={230} />
          <g clipPath={`url(#${id("upper")})`}>
            <circle cx="200" cy="250" r="120" fill={`url(#${id("glow")})`} />
            <circle cx="200" cy="250" r="78" fill={`url(#${id("sun")})`} />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x="100" y={226 + i * 11} width="200" height={2 + i * 1.4} fill={c3} />
            ))}
          </g>
          <path d="M0 300 L70 240 L120 270 L180 220 L240 265 L300 230 L400 290 L400 300 Z" fill="#0a0626" />
          <rect x="0" y="300" width="400" height="200" fill="#07051a" />
          <g stroke={c2} strokeOpacity="0.55" strokeWidth="1">
            {Array.from({ length: 13 }, (_, i) => (
              <line key={i} x1={200} y1={300} x2={-400 + i * 100} y2={500} />
            ))}
            {[310, 325, 348, 380, 425, 490].map((y) => (
              <line key={y} x1={0} y1={y} x2={400} y2={y} />
            ))}
          </g>
          <path d="M180 300 L220 300 L330 500 L70 500 Z" fill="#0b0920" />
          <line
            x1="200"
            y1="300"
            x2="200"
            y2="500"
            stroke={c1}
            strokeWidth="4"
            strokeDasharray="22 18"
            style={{ animation: "road 0.7s linear infinite" }}
          />
        </g>
      )}

      {mood.scene === "rain" && (
        <g>
          <circle cx="120" cy="140" r="160" fill={`url(#${id("glow")})`} opacity={0.5} />
          <Skyline seed={21} color="#0a1426" y={470} />
          <g stroke={c1} strokeWidth="1.3" strokeLinecap="round" opacity={0.65}>
            {(() => {
              const r = rand(13);
              return Array.from({ length: 60 }, (_, i) => {
                const x = r() * 470;
                const y = r() * 500 - 520;
                const len = 14 + r() * 20;
                return (
                  <line
                    key={i}
                    x1={x}
                    y1={y}
                    x2={x - len * 0.12}
                    y2={y + len}
                    style={{ animation: `rain ${0.7 + r() * 0.6}s linear ${-r() * 2}s infinite` }}
                  />
                );
              });
            })()}
          </g>
          <g fill="#fff" opacity={0.18}>
            {(() => {
              const r = rand(17);
              return Array.from({ length: 22 }, (_, i) => (
                <ellipse key={i} cx={r() * 400} cy={r() * 500} rx={2 + r() * 4} ry={3 + r() * 6} />
              ));
            })()}
          </g>
        </g>
      )}

      {mood.scene === "sun" && (
        <g>
          <circle cx="200" cy="270" r="200" fill={`url(#${id("glow")})`} />
          <g clipPath={`url(#${id("upper")})`}>
            <circle cx="200" cy="290" r="110" fill={`url(#${id("sun")})`} style={{ animation: "float 14s ease-in-out infinite", transformOrigin: "200px 290px" }} />
          </g>
          <rect x="0" y="300" width="400" height="200" fill={c3} opacity={0.75} />
          <g fill={c1}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect
                key={i}
                x={200 - (100 - i * 10)}
                y={312 + i * 18}
                width={(100 - i * 10) * 2}
                height={3}
                rx={1.5}
                opacity={0.8 - i * 0.09}
              />
            ))}
          </g>
          <path d="M-10 300 Q60 280 120 300 T260 298 T410 300" fill="none" stroke="#fff" strokeOpacity="0.2" />
        </g>
      )}

      {mood.scene === "wave" && (
        <g>
          <circle cx="280" cy="140" r="160" fill={`url(#${id("glow")})`} opacity={0.7} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} style={{ animation: `wave ${8 + i * 3}s linear infinite` }}>
              <path
                d={`M0 ${290 + i * 45} ${Array.from({ length: 6 }, (_, k) => `q 50 ${-30 + i * 4} 100 0 t 100 0`).join(" ")} L800 500 L0 500 Z`}
                fill={i % 2 ? c2 : c1}
                opacity={0.18 + i * 0.12}
              />
            </g>
          ))}
          <Stars count={20} seed={31} maxY={220} />
        </g>
      )}

      {mood.scene === "fire" && (
        <g>
          <circle cx="200" cy="380" r="220" fill={`url(#${id("glow")})`} />
          <g filter={intense ? undefined : `url(#${id("blur")})`} opacity={0.9}>
            {[
              { x: 200, h: 230, w: 90, c: c2, d: 0 },
              { x: 160, h: 170, w: 70, c: c1, d: 0.4 },
              { x: 245, h: 180, w: 70, c: c1, d: 0.8 },
              { x: 200, h: 140, w: 55, c: "#ffe08a", d: 0.2 },
            ].map((f, i) => (
              <path
                key={i}
                d={`M${f.x - f.w} 500 C${f.x - f.w} ${500 - f.h * 0.6} ${f.x - 10} ${500 - f.h * 0.7} ${f.x} ${500 - f.h} C${f.x + 10} ${500 - f.h * 0.7} ${f.x + f.w} ${500 - f.h * 0.6} ${f.x + f.w} 500 Z`}
                fill={f.c}
                style={{
                  transformOrigin: `${f.x}px 500px`,
                  animation: `flicker ${1.4 + i * 0.3}s ease-in-out ${f.d}s infinite`,
                }}
              />
            ))}
          </g>
          {(() => {
            const r = rand(41);
            return Array.from({ length: 24 }, (_, i) => (
              <circle
                key={i}
                cx={80 + r() * 240}
                cy={480}
                r={1 + r() * 2}
                fill="#ffd27a"
                style={{ animation: `ember ${3 + r() * 4}s linear ${-r() * 6}s infinite` }}
              />
            ));
          })()}
        </g>
      )}

      {mood.scene === "stars" && (
        <g>
          <Stars count={120} seed={51} />
          <circle cx="110" cy="130" r="130" fill={`url(#${id("glow")})`} opacity={0.7} />
          <g style={{ animation: "float 16s ease-in-out infinite", transformOrigin: "110px 130px" }}>
            <circle cx="110" cy="130" r="40" fill="#eef0ff" />
            <circle cx="128" cy="118" r="36" fill={c3} />
          </g>
          <g stroke={c1} strokeOpacity="0.5" strokeWidth="1" fill="none">
            <polyline points="230,260 270,230 310,250 335,215 360,240" />
          </g>
          <g fill="#fff">
            {[
              [230, 260],
              [270, 230],
              [310, 250],
              [335, 215],
              [360, 240],
            ].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r={2.4} />
            ))}
          </g>
          <path
            d="M0 420 Q100 380 200 410 T400 400 L400 500 L0 500 Z"
            fill={c2}
            opacity={0.25}
          />
        </g>
      )}

      <rect width="400" height="500" fill={`url(#${id("fade")})`} />
    </svg>
  );
}
