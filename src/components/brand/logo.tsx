import { cn } from "@/lib/utils";

/** Bloom sprout isotype — two leaves growing from a stem. */
export function BloomMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <path
        d="M16 29V14"
        stroke="var(--brand-leaf)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M16 17C16 11 11.5 7 5.5 6.5C5 12 9 16.5 16 17Z"
        fill="var(--brand-leaf)"
        opacity="0.9"
      />
      <path
        d="M16 14C16 7.5 20.5 3.5 26.5 3C27 9 23 13.5 16 14Z"
        fill="var(--primary)"
      />
    </svg>
  );
}

export function BloomLogo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BloomMark />
      {showText && (
        <span className="font-heading text-lg font-bold tracking-tight">
          Bloom <span className="text-primary">English</span>
        </span>
      )}
    </span>
  );
}
