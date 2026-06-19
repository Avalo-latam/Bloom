import { cn } from "@/lib/utils";

type IconProps = { className?: string };

/* ───────────────────────── Decorative petal / leaf ───────────────────────── */
export function Petal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("size-5", className)}>
      <path
        d="M12 2C5 6 4 14 12 22C20 14 19 6 12 2Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M12 5.5V20" stroke="white" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ───────────────────────── Feature glyphs (bespoke) ──────────────────────── */

/** Live class / Classroom mode — a board on a stand with a play + sprout. */
export function ArtClassroom({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={cn("size-9", className)}>
      <rect x="5" y="7" width="38" height="27" rx="6" fill="var(--brand-sky)" />
      <rect x="9" y="11" width="30" height="19" rx="3.5" fill="white" fillOpacity="0.65" />
      <path d="M21 16.5v8l7-4-7-4Z" fill="var(--primary)" />
      <path d="M24 34v5" stroke="var(--brand-leaf)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 39c0-3-2.4-5-5.5-5.2C18.2 37 21 39 24 39Z" fill="var(--brand-leaf)" />
      <path d="M24 38c0-2.6 2-4.4 4.8-4.6C29 36 26.6 38 24 38Z" fill="var(--brand-mint)" />
      <path d="M16 43h16" stroke="var(--brand-leaf)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Interactive games & quizzes — chat bubble with a star + sparkles. */
export function ArtGames({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={cn("size-9", className)}>
      <path
        d="M9 8h26a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5H20l-8 6v-6h-3a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5Z"
        fill="var(--brand-lila)"
      />
      <path
        d="M22 13.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9 2.6-5.3Z"
        fill="white"
        fillOpacity="0.9"
      />
      <circle cx="40" cy="11" r="2.4" fill="var(--brand-lemon)" />
      <circle cx="8" cy="34" r="1.8" fill="var(--brand-peach)" />
    </svg>
  );
}

/** Progress — a pot with ascending leaves and sparkles. */
export function ArtProgress({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={cn("size-9", className)}>
      <path d="M24 38V20" stroke="var(--brand-leaf)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M24 27c-1-5-5-7.5-10-7.5C14.3 25 18.5 28 24 27Z" fill="var(--brand-mint)" />
      <path d="M24 23c1-5.5 5.2-8 10.5-8C34.2 21 29.8 24 24 23Z" fill="var(--brand-leaf)" />
      <path d="M14 38h20l-2.2 5.4a2 2 0 0 1-1.85 1.25H18.05a2 2 0 0 1-1.85-1.25L14 38Z" fill="var(--brand-peach)" />
      <path d="M13 38h22" stroke="var(--primary)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M37 9l.9 2.6 2.6.9-2.6.9L37 16l-.9-2.6-2.6-.9 2.6-.9L37 9Z" fill="var(--brand-lemon)" />
    </svg>
  );
}

/** Levels A1→C1 — ascending rounded steps, each crowned with a leaf. */
export function ArtLevels({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={cn("size-9", className)}>
      <rect x="5" y="30" width="10" height="13" rx="3" fill="var(--brand-mint)" />
      <rect x="19" y="22" width="10" height="21" rx="3" fill="var(--brand-sky)" />
      <rect x="33" y="12" width="10" height="31" rx="3" fill="var(--brand-lila)" />
      <circle cx="10" cy="26" r="2.4" fill="var(--brand-leaf)" />
      <circle cx="24" cy="18" r="2.4" fill="var(--brand-leaf)" />
      <path d="M38 11.5c0-3 2-5 5-5.2c.2 3.1-1.9 5-5 5.2Z" fill="var(--brand-leaf)" />
    </svg>
  );
}

/** Phonetics — sound wave bars with a play note. */
export function ArtPhonetics({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={cn("size-9", className)}>
      <circle cx="24" cy="24" r="19" fill="var(--brand-peach)" fillOpacity="0.55" />
      {[
        [15, 8],
        [20, 16],
        [24, 24],
        [28, 16],
        [33, 10],
      ].map(([x, h], i) => (
        <rect
          key={i}
          x={x - 1.6}
          y={24 - h / 2}
          width="3.2"
          height={h}
          rx="1.6"
          fill={i === 2 ? "var(--primary)" : "var(--brand-rose)"}
        />
      ))}
    </svg>
  );
}

/** Homework & feedback — a card with check lines and a heart. */
export function ArtFeedback({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={cn("size-9", className)}>
      <rect x="8" y="6" width="32" height="36" rx="6" fill="var(--brand-rose)" fillOpacity="0.6" />
      <rect x="13" y="11" width="22" height="5" rx="2.5" fill="white" fillOpacity="0.85" />
      <path d="M14 23l2.2 2.2L20.5 21" stroke="var(--brand-leaf)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 24h10" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 31l2.2 2.2L20.5 29" stroke="var(--brand-leaf)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M31 33.5c0-2 3-3 3-0.2 0 1.6-3 3.2-3 3.2s-3-1.6-3-3.2c0-2.8 3-1.8 3 0.2Z"
        fill="var(--primary)"
      />
    </svg>
  );
}

/** "My garden" — progress as a growing, blooming garden (bespoke). */
export function GrowthGarden({
  completed,
  total,
  className,
}: {
  completed: number;
  total: number;
  className?: string;
}) {
  const slots = Math.min(Math.max(total, 1), 12);
  const bloomed = Math.round((Math.min(completed, total) / Math.max(total, 1)) * slots);
  const colors = [
    "var(--brand-rose)",
    "var(--brand-lila)",
    "var(--brand-peach)",
    "var(--brand-lemon)",
    "var(--brand-sky)",
  ];
  const W = 360;
  const gap = W / (slots + 1);

  return (
    <svg viewBox="0 0 360 150" fill="none" aria-hidden className={cn("w-full", className)}>
      {/* sun */}
      <circle cx="324" cy="30" r="14" fill="var(--brand-lemon)" />
      <g stroke="var(--brand-lemon)" strokeWidth="2.4" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={a} d="M324 8v5" transform={`rotate(${a} 324 30)`} />
        ))}
      </g>

      {/* ground */}
      <path d="M0 124c60-10 120-10 180-8s120 0 180-6v40H0v-26Z" fill="var(--brand-leaf)" opacity="0.25" />
      <path d="M0 130c60-8 120-8 180-6s120 0 180-5" stroke="var(--brand-leaf)" strokeWidth="2" opacity="0.5" />

      {Array.from({ length: slots }).map((_, i) => {
        const x = gap * (i + 1);
        const isBloom = i < bloomed;
        const color = colors[i % colors.length];
        const delay = `${(i % 5) * 0.4}s`;
        return (
          <g key={i}>
            {/* stem */}
            <path
              d={`M${x} 128V${isBloom ? 86 : 108}`}
              stroke="var(--brand-leaf)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            {/* leaf */}
            <path
              d={`M${x} ${isBloom ? 108 : 116}c-6-3-11-1.5-13 2 4 2.5 9 1.5 13-2Z`}
              fill="var(--brand-mint)"
            />
            {isBloom ? (
              <g className="animate-sway" style={{ transformOrigin: `${x}px 86px`, animationDelay: delay }}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse
                    key={a}
                    cx={x}
                    cy={74}
                    rx="4.5"
                    ry="8"
                    fill={color}
                    transform={`rotate(${a} ${x} 84)`}
                  />
                ))}
                <circle cx={x} cy="84" r="4.5" fill="var(--brand-lemon)" />
              </g>
            ) : (
              <circle cx={x} cy="104" r="4" fill="var(--brand-mint)" opacity="0.7" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Friendly bespoke teacher avatar (not a stock icon). */
export function TeacherAvatar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden className={cn("size-16", className)}>
      <circle cx="36" cy="36" r="34" fill="var(--brand-peach)" fillOpacity="0.5" />
      {/* hair */}
      <path d="M16 38c0-13 9-22 20-22s20 9 20 22c0 3-1 6-2 8-1-4-2-9-4-11-3 3-9 5-16 5s-12-2-14-4c-1 3-2 8-2 11-1-3-2-6-2-9Z" fill="var(--primary)" />
      {/* face */}
      <circle cx="36" cy="40" r="15" fill="#F4D9C6" />
      {/* cheeks */}
      <circle cx="29" cy="43" r="2.6" fill="var(--brand-rose)" fillOpacity="0.7" />
      <circle cx="43" cy="43" r="2.6" fill="var(--brand-rose)" fillOpacity="0.7" />
      {/* eyes + smile */}
      <circle cx="31" cy="39" r="1.7" fill="var(--foreground)" />
      <circle cx="41" cy="39" r="1.7" fill="var(--foreground)" />
      <path d="M31 46c2.6 2.6 7.4 2.6 10 0" stroke="var(--foreground)" strokeWidth="1.8" strokeLinecap="round" />
      {/* little leaf in hair */}
      <path d="M49 24c4-2 8-1 9 2-3 2-7 1.6-9-2Z" fill="var(--brand-leaf)" />
    </svg>
  );
}

/* ───────────────────────── Hero scene — open book + growing bloom ────────── */
export function BloomScene({ className }: IconProps) {
  return (
    <svg viewBox="0 0 300 260" fill="none" aria-hidden className={cn("w-full", className)}>
      <defs>
        <linearGradient id="bs-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand-sky)" />
          <stop offset="1" stopColor="var(--brand-lila)" />
        </linearGradient>
        <linearGradient id="bs-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.95" />
          <stop offset="1" stopColor="white" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* halo */}
      <circle cx="150" cy="120" r="100" fill="url(#bs-sky)" opacity="0.35" />
      <circle cx="150" cy="120" r="72" fill="var(--brand-mint)" opacity="0.25" />

      {/* stem + flower growing from the book */}
      <path d="M150 168V96" stroke="var(--brand-leaf)" strokeWidth="4" strokeLinecap="round" />
      <path d="M150 128c-3-12-13-18-25-18 .5 13 11 19 25 18Z" fill="var(--brand-mint)" />
      <path d="M150 116c3-13 13-19 26-19-.5 14-11 20-26 19Z" fill="var(--brand-leaf)" />
      <g className="animate-sway" style={{ transformOrigin: "150px 96px" }}>
        <circle cx="150" cy="84" r="13" fill="var(--brand-rose)" />
        <circle cx="150" cy="84" r="6" fill="var(--brand-lemon)" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx="150"
            cy="68"
            rx="6"
            ry="11"
            fill="var(--brand-rose)"
            transform={`rotate(${a} 150 84)`}
          />
        ))}
        <circle cx="150" cy="84" r="6" fill="var(--brand-lemon)" />
      </g>

      {/* open book */}
      <path d="M150 170c-16-10-40-12-58-9V134c18-3 42-1 58 9v27Z" fill="url(#bs-page)" stroke="var(--primary)" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M150 170c16-10 40-12 58-9V134c-18-3-42-1-58 9v27Z" fill="url(#bs-page)" stroke="var(--primary)" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M150 161V170" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      <path d="M104 150h30M104 158h26" stroke="var(--brand-sky)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M196 150h-30M196 158h-26" stroke="var(--brand-lila)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M92 161c-18-3-42-1-58 9" stroke="transparent" />

      {/* book base shadow */}
      <ellipse cx="150" cy="178" rx="66" ry="8" fill="var(--primary)" opacity="0.12" />

      {/* floating letter chips */}
      <g className="animate-float" style={{ animationDelay: "0s" }}>
        <rect x="56" y="64" width="34" height="34" rx="11" fill="var(--primary)" />
        <text x="73" y="87" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="800" fontSize="19" fill="white">A</text>
      </g>
      <g className="animate-float" style={{ animationDelay: "1.2s" }}>
        <rect x="212" y="48" width="32" height="32" rx="10" fill="var(--brand-peach)" />
        <text x="228" y="70" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="800" fontSize="18" fill="var(--foreground)">B</text>
      </g>
      <g className="animate-float" style={{ animationDelay: "0.6s" }}>
        <rect x="226" y="150" width="30" height="30" rx="10" fill="var(--brand-leaf)" />
        <text x="241" y="171" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="800" fontSize="17" fill="white">C</text>
      </g>

      {/* sparkles */}
      <g fill="var(--brand-lemon)">
        <circle className="animate-twinkle" cx="70" cy="130" r="3" />
        <circle className="animate-twinkle" style={{ animationDelay: "1s" }} cx="232" cy="110" r="2.5" />
        <circle className="animate-twinkle" style={{ animationDelay: "2s" }} cx="120" cy="40" r="2.5" />
      </g>
    </svg>
  );
}
