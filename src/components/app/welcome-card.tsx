"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export function WelcomeCard() {
  const t = useTranslations("welcome");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-6 overflow-hidden rounded-3xl border bg-gradient-to-br from-brand-lila/25 via-card to-brand-mint/20 p-7 shadow-sm sm:p-9"
    >
      {/* soft decorative glow, not an icon */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-rose/20 blur-2xl" />
      <div className="relative max-w-2xl">
        <h2 className="font-heading text-xl font-bold sm:text-2xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          {t("body")}
        </p>
        <div className="mt-4">
          <span className="font-heading text-lg font-semibold text-primary">
            {t("signature")}
          </span>
          {/* hand-drawn signature flourish (bespoke) */}
          <svg
            viewBox="0 0 120 12"
            fill="none"
            aria-hidden
            className="mt-1 h-3 w-28 text-primary/60"
          >
            <path
              d="M2 7c10-5 22-5 34-1s24 6 34 1 16-6 24-3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
