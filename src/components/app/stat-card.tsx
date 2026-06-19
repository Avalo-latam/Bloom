import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  tone = "primary",
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: string;
  href?: string;
  tone?: "primary" | "mint" | "peach" | "lila" | "sky" | "rose";
}) {
  const toneBg: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    mint: "bg-brand-mint/40 text-foreground/70",
    peach: "bg-brand-peach/40 text-foreground/70",
    lila: "bg-brand-lila/40 text-foreground/70",
    sky: "bg-brand-sky/40 text-foreground/70",
    rose: "bg-brand-rose/40 text-foreground/70",
  };

  const inner = (
    <div className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-xl",
            toneBg[tone],
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <div className="font-heading text-3xl font-bold tracking-tight">
        {value}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
