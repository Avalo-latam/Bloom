"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Petal } from "@/components/brand/illustrations";

const COLORS = [
  "text-brand-rose",
  "text-brand-lila",
  "text-brand-peach",
  "text-brand-lemon",
  "text-brand-sky",
  "text-brand-mint",
];

// Precomputed burst vectors (deterministic).
const PIECES = Array.from({ length: 28 }).map((_, i) => {
  const angle = (i / 28) * Math.PI * 2 + (i % 3) * 0.3;
  const dist = 120 + (i % 5) * 60;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist - 40,
    rot: (i % 2 ? 1 : -1) * (180 + (i % 4) * 90),
    color: COLORS[i % COLORS.length],
    size: 12 + (i % 4) * 5,
    delay: (i % 6) * 0.03,
  };
});

/** Fires a one-shot petal burst from the centre when `fire` increments. */
export function Celebrate({ fire }: { fire: number }) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (fire <= 0) return;
    setShow(true);
    const tid = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(tid);
  }, [fire]);

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          {PIECES.map((p, i) => (
            <motion.span
              key={`${fire}-${i}`}
              className={p.color}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4, rotate: 0 }}
              animate={{ opacity: [0, 1, 1, 0], x: p.x, y: p.y, scale: 1, rotate: p.rot }}
              transition={{ duration: 1.3, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "absolute", width: p.size, height: p.size }}
            >
              <Petal className="size-full" />
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
