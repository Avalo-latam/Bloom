"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { TeacherAvatar, Petal } from "@/components/brand/illustrations";

export function WelcomeCard() {
  const t = useTranslations("welcome");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-6 overflow-hidden rounded-3xl border bg-gradient-to-br from-brand-lila/30 via-card to-brand-mint/25 p-6 shadow-sm sm:p-7"
    >
      <Petal className="absolute right-6 top-5 size-6 rotate-12 text-brand-rose/60" />
      <Petal className="absolute right-16 top-12 size-4 -rotate-12 text-brand-lila/60" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <motion.div
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="shrink-0"
        >
          <TeacherAvatar />
        </motion.div>
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-bold">{t("title")}</h2>
          <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {t("body")}
          </p>
          <p className="mt-3 font-heading text-sm font-semibold text-primary">
            {t("signature")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
