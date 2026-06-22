"use client";

import { QuizPlayer } from "@/components/quiz/quiz-player";
import { submitExamResult } from "@/app/app/exams/actions";
import type { Quiz } from "@/lib/quiz";

export function ExamTaker({ examId, quiz }: { examId: string; quiz: Quiz }) {
  return (
    <QuizPlayer
      quiz={quiz}
      onFinish={(pct) => {
        void submitExamResult(examId, pct);
      }}
    />
  );
}
