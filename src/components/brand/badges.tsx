import { cn } from "@/lib/utils";

export type BadgeVariant = "first" | "garden" | "unit" | "scholar" | "level";

/** Bespoke achievement medallions. `earned` toggles full colour vs. locked. */
export function AchievementBadge({
  variant,
  earned,
  className,
}: {
  variant: BadgeVariant;
  earned: boolean;
  className?: string;
}) {
  const ring = earned ? "var(--primary)" : "var(--muted-foreground)";
  const fill = earned ? colorFor(variant) : "var(--muted)";
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={cn("size-16", !earned && "opacity-45 grayscale", className)}
    >
      {/* ribbons */}
      <path d="M24 44l-5 14 7-4 6 4-4-14Z" fill={fill} opacity="0.7" />
      <path d="M40 44l5 14-7-4-6 4 4-14Z" fill={fill} opacity="0.7" />
      {/* medallion */}
      <circle cx="32" cy="28" r="20" fill={fill} opacity="0.35" />
      <circle cx="32" cy="28" r="20" stroke={ring} strokeWidth="2.5" />
      <Motif variant={variant} />
      {!earned && (
        <g>
          <rect x="27" y="40" width="10" height="8" rx="2" fill="var(--muted-foreground)" />
          <path d="M29 40v-2a3 3 0 0 1 6 0v2" stroke="var(--muted-foreground)" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  );
}

function colorFor(v: BadgeVariant) {
  return {
    first: "var(--brand-rose)",
    garden: "var(--brand-mint)",
    unit: "var(--brand-lila)",
    scholar: "var(--brand-sky)",
    level: "var(--brand-lemon)",
  }[v];
}

function Motif({ variant }: { variant: BadgeVariant }) {
  switch (variant) {
    case "first":
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="32" cy="22" rx="3.4" ry="6" fill="var(--brand-rose)" transform={`rotate(${a} 32 28)`} />
          ))}
          <circle cx="32" cy="28" r="4" fill="var(--brand-lemon)" />
        </g>
      );
    case "garden":
      return (
        <g fill="var(--brand-leaf)">
          <circle cx="24" cy="30" r="4" />
          <circle cx="32" cy="24" r="5" fill="var(--brand-rose)" />
          <circle cx="40" cy="30" r="4" />
          <path d="M24 34v6M32 30v8M40 34v6" stroke="var(--brand-leaf)" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "unit":
      return (
        <path d="M32 18l3.2 6.5 7.1 1-5.2 5 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5.2-5 7.1-1L32 18Z" fill="var(--brand-lemon)" />
      );
    case "scholar":
      return (
        <g>
          <path d="M20 26l12-5 12 5-12 5-12-5Z" fill="var(--brand-sky)" />
          <path d="M44 26v6" stroke="var(--brand-sky)" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 29v5c0 2 12 2 12 0v-5" stroke="var(--primary)" strokeWidth="2" fill="none" />
        </g>
      );
    case "level":
      return (
        <g>
          <path d="M20 34l-2-12 8 6 6-9 6 9 8-6-2 12H20Z" fill="var(--brand-lemon)" stroke="var(--primary)" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      );
  }
}
