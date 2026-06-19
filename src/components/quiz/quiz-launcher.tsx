"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import type { Quiz } from "@/lib/quiz";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { Button } from "@/components/ui/button";

export function QuizLauncher({ quiz }: { quiz: Quiz }) {
  const t = useTranslations("quiz");
  const [open, setOpen] = React.useState(false);

  if (open) return <QuizPlayer quiz={quiz} />;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="glass-card flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-transform hover:-translate-y-0.5"
    >
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-lila/40">
        <Sparkles className="size-6 text-primary" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading font-bold">{quiz.title}</span>
        {quiz.description && (
          <span className="block truncate text-sm text-muted-foreground">
            {quiz.description}
          </span>
        )}
      </span>
      <Button size="sm" asChild>
        <span>{t("startQuiz")}</span>
      </Button>
    </button>
  );
}
