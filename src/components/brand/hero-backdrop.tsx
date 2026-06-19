import { Petal } from "@/components/brand/illustrations";
import { cn } from "@/lib/utils";

// Fixed (deterministic) petals so SSR and client markup match.
const PETALS = [
  { left: "8%", delay: "0s", dur: "15s", size: "size-4", color: "text-brand-rose", drift: "30px", spin: "200deg", op: 0.6 },
  { left: "20%", delay: "4s", dur: "19s", size: "size-3", color: "text-brand-lila", drift: "-40px", spin: "-180deg", op: 0.5 },
  { left: "33%", delay: "8s", dur: "17s", size: "size-5", color: "text-brand-peach", drift: "50px", spin: "260deg", op: 0.55 },
  { left: "46%", delay: "2s", dur: "21s", size: "size-3", color: "text-brand-mint", drift: "-30px", spin: "160deg", op: 0.5 },
  { left: "58%", delay: "11s", dur: "16s", size: "size-4", color: "text-brand-sky", drift: "40px", spin: "-220deg", op: 0.55 },
  { left: "70%", delay: "6s", dur: "20s", size: "size-5", color: "text-brand-rose", drift: "-50px", spin: "200deg", op: 0.5 },
  { left: "82%", delay: "1s", dur: "18s", size: "size-3", color: "text-brand-lemon", drift: "30px", spin: "180deg", op: 0.6 },
  { left: "92%", delay: "9s", dur: "22s", size: "size-4", color: "text-brand-lila", drift: "-35px", spin: "-200deg", op: 0.5 },
];

export function HeroBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* Drifting gradient blobs */}
      <div className="animate-blob absolute -left-24 -top-24 size-[34rem] rounded-full bg-brand-lila/40 blur-3xl" />
      <div
        className="animate-blob absolute -right-24 top-0 size-[30rem] rounded-full bg-brand-sky/40 blur-3xl"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="animate-blob absolute bottom-[-10rem] left-1/3 size-[36rem] rounded-full bg-brand-mint/35 blur-3xl"
        style={{ animationDelay: "6s" }}
      />

      {/* Falling petals */}
      {PETALS.map((p, i) => (
        <span
          key={i}
          className={cn("absolute -top-8", p.color)}
          style={{
            left: p.left,
            animation: `drift ${p.dur} linear ${p.delay} infinite`,
            ["--petal-drift" as string]: p.drift,
            ["--petal-spin" as string]: p.spin,
            ["--petal-opacity" as string]: p.op,
          }}
        >
          <Petal className={p.size} />
        </span>
      ))}
    </div>
  );
}
