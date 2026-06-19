import { cn } from "@/lib/utils";
import { LEVEL_META, LevelCode } from "@/lib/levels";

export function LevelBadge({
  code,
  className,
  size = "md",
}: {
  code: LevelCode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const meta = LEVEL_META[code];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-heading font-bold text-foreground/80 ring-1 ring-black/5 dark:ring-white/10",
        size === "sm" && "h-6 px-2 text-xs",
        size === "md" && "h-7 px-3 text-sm",
        size === "lg" && "h-9 px-4 text-base",
        className,
      )}
      style={{ backgroundColor: `var(--${meta.color})` }}
    >
      {meta.short}
    </span>
  );
}
