import { cn } from "@/lib/utils";

// Deterministic floating colour drops ("gotitas de color").
const DROPS = [
  { top: "12%", left: "8%", size: "size-3", color: "bg-brand-rose", delay: "0s" },
  { top: "24%", left: "82%", size: "size-2.5", color: "bg-brand-sky", delay: "1.5s" },
  { top: "40%", left: "16%", size: "size-2", color: "bg-brand-lemon", delay: "3s" },
  { top: "62%", left: "88%", size: "size-3", color: "bg-brand-lila", delay: "0.8s" },
  { top: "74%", left: "10%", size: "size-2.5", color: "bg-brand-mint", delay: "2.2s" },
  { top: "84%", left: "70%", size: "size-2", color: "bg-brand-peach", delay: "4s" },
  { top: "16%", left: "48%", size: "size-2", color: "bg-brand-lila", delay: "2.8s" },
  { top: "52%", left: "60%", size: "size-2.5", color: "bg-brand-rose", delay: "1.1s" },
];

/** Living, colourful campus backdrop: drifting blobs + floating colour drops. */
export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-campus pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* drifting pastel blobs */}
      <div className="animate-blob absolute -left-32 -top-28 size-[38rem] rounded-full bg-brand-lila/45 blur-[80px] dark:bg-brand-lila/25" />
      <div
        className="animate-blob absolute -right-28 top-6 size-[32rem] rounded-full bg-brand-sky/45 blur-[80px] dark:bg-brand-sky/25"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="animate-blob absolute bottom-[-12rem] left-1/4 size-[40rem] rounded-full bg-brand-mint/40 blur-[90px] dark:bg-brand-mint/20"
        style={{ animationDelay: "8s" }}
      />
      <div
        className="animate-blob absolute right-1/5 bottom-[-8rem] size-[30rem] rounded-full bg-brand-peach/40 blur-[80px] dark:bg-brand-peach/20"
        style={{ animationDelay: "11s" }}
      />

      {/* floating colour drops */}
      {DROPS.map((d, i) => (
        <span
          key={i}
          className={cn(
            "animate-float-slow absolute rounded-full opacity-70 shadow-sm dark:opacity-50",
            d.size,
            d.color,
          )}
          style={{ top: d.top, left: d.left, animationDelay: d.delay }}
        />
      ))}
    </div>
  );
}
