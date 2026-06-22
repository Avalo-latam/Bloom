import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Clock, Lock, Lightbulb, BookText, MessagesSquare } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/level-badge";
import { CompleteLessonButton } from "@/components/app/complete-lesson-button";
import { BLOCK_META, type BlockKind, type BlockContent } from "@/lib/blocks";
import { YouTubeEmbed } from "@/components/embeds/youtube";
import { QuizLauncher } from "@/components/quiz/quiz-launcher";
import { PhoneticsPractice } from "@/components/app/phonetics-practice";
import type { Quiz } from "@/lib/quiz";
import type { LevelCode } from "@/lib/levels";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("curriculum");
  const tq = await getTranslations("quiz");
  const isStaff = profile.role !== "student";

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, objective, level:levels(code, subtitle), unit:units(title)")
    .eq("id", id)
    .maybeSingle();
  if (!lesson) notFound();

  let locked = false;
  let isAsync = false;
  let completed = false;
  if (profile.role === "student") {
    const [{ data: access }, { data: enr }] = await Promise.all([
      supabase
        .from("lesson_access")
        .select("lesson_id, completed_at")
        .eq("lesson_id", id)
        .eq("student_id", profile.id)
        .maybeSingle(),
      supabase
        .from("enrollments")
        .select("plan")
        .eq("student_id", profile.id)
        .eq("status", "active")
        .maybeSingle(),
    ]);
    locked = !access;
    completed = !!access?.completed_at;
    isAsync = enr?.plan === "async";
  }

  const { data: blocks } = await supabase
    .from("lesson_blocks")
    .select("id, kind, title, content, sort_order")
    .eq("lesson_id", id)
    .order("sort_order");

  const quizIds = (blocks ?? [])
    .map((b) => (b.content as BlockContent)?.quizId)
    .filter((x): x is string => !!x);
  const quizMap = new Map<string, Quiz>();
  if (quizIds.length && !locked) {
    const { data: qs } = await supabase
      .from("quizzes")
      .select(
        "id, title, description, questions:quiz_questions(id, kind, prompt, media_url, data, explanation, points, sort_order)",
      )
      .in("id", quizIds);
    (qs ?? []).forEach((quiz) => {
      const questions = [...((quiz.questions as Quiz["questions"]) ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      quizMap.set(quiz.id, {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions,
      });
    });
  }

  const level = lesson.level as { code: LevelCode; subtitle: string } | null;
  const unit = lesson.unit as { title: string } | null;

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
        <Link href={level ? `/app/curriculum/${level.code}` : "/app/curriculum"}>
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
      </Button>

      <div className="rounded-3xl glass-card p-6">
        {level && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <LevelBadge code={level.code} size="sm" />
            {unit?.title}
          </div>
        )}
        <h1 className="font-heading text-3xl font-bold">{lesson.title}</h1>
        {lesson.objective && (
          <p className="mt-2 text-muted-foreground">{lesson.objective}</p>
        )}
      </div>

      {locked ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <Lock className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isAsync ? t("lockedHintAsync") : t("lockedHint")}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {(blocks ?? []).map((block) => {
            const meta = BLOCK_META[block.kind as BlockKind];
            const Icon = meta?.icon ?? Clock;
            const c = (block.content ?? {}) as BlockContent;
            const quiz = c.quizId ? quizMap.get(c.quizId) : undefined;
            return (
              <section key={block.id} className="rounded-3xl glass-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="inline-flex size-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `var(--${meta?.color ?? "muted"})` }}
                  >
                    <Icon className="size-4.5 text-foreground/70" />
                  </span>
                  <h2 className="font-heading text-lg font-bold">{block.title}</h2>
                </div>

                {/* Teacher-only choreography note */}
                {isStaff && c.guide && (
                  <p className="mb-4 rounded-xl border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    👩‍🏫 {c.guide}
                  </p>
                )}

                {c.html && (
                  <div
                    className="space-y-2 leading-relaxed [&_em]:font-semibold [&_em]:not-italic [&_em]:text-primary [&_li]:mt-1 [&_p]:text-foreground/90 [&_strong]:font-semibold [&_ul]:ml-4 [&_ul]:list-disc"
                    dangerouslySetInnerHTML={{ __html: c.html }}
                  />
                )}

                {c.examples && c.examples.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {c.examples.map((ex, i) => (
                      <li
                        key={i}
                        className="flex gap-2 rounded-xl bg-brand-mint/25 px-3 py-2 text-sm"
                        dangerouslySetInnerHTML={{ __html: `<span>🌿</span><span>${ex}</span>` }}
                      />
                    ))}
                  </ul>
                )}

                {c.vocab && c.vocab.length > 0 && (
                  <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {c.vocab.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-baseline justify-between gap-2 rounded-lg border bg-card/60 px-3 py-1.5 text-sm"
                      >
                        <span className="font-medium">{v.term}</span>
                        <span className="text-muted-foreground">{v.es}</span>
                      </div>
                    ))}
                  </div>
                )}

                {c.reading && (
                  <div className="mt-3 rounded-2xl border bg-card/60 p-4">
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <BookText className="size-3.5" />
                      {c.reading.title ?? "Reading"}
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {c.reading.text}
                    </p>
                  </div>
                )}

                {c.videoUrl && <YouTubeEmbed url={c.videoUrl} className="mt-3" />}

                {c.videoSearch && (
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(c.videoSearch + " english lesson")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-3 rounded-2xl bg-brand-sky/30 px-4 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
                  >
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FF0000]/90 text-white">
                      ▶
                    </span>
                    <span>
                      🎬 Watch a video about{" "}
                      <strong>{c.videoSearch}</strong>
                      <span className="block text-xs text-muted-foreground">
                        Then answer the questions below.
                      </span>
                    </span>
                  </a>
                )}

                {c.speaking && c.speaking.length > 0 && (
                  <div className="mt-3 rounded-2xl bg-brand-rose/15 p-4">
                    <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                      <MessagesSquare className="size-4 text-primary" />
                      Speaking
                    </div>
                    <ul className="space-y-1 text-sm">
                      {c.speaking.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {c.phonetics && c.phonetics.length > 0 && (
                  <div className="mt-3">
                    <PhoneticsPractice items={c.phonetics} />
                  </div>
                )}

                {c.tip && (
                  <p className="mt-3 flex gap-2 rounded-xl bg-brand-lemon/30 px-3 py-2 text-sm">
                    <Lightbulb className="size-4 shrink-0 text-foreground/60" />
                    <span>{c.tip}</span>
                  </p>
                )}

                {c.kahootUrl && (
                  <a
                    href={c.kahootUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-lemon/60 px-4 py-2 text-sm font-semibold text-foreground/80 transition-transform hover:-translate-y-0.5"
                  >
                    🎮 {tq("playKahoot")}
                  </a>
                )}

                {quiz && (
                  <div className="mt-4">
                    <QuizLauncher quiz={quiz} />
                  </div>
                )}
              </section>
            );
          })}

          {/* Student: mark the lesson complete (drives the garden + async unlock) */}
          {profile.role === "student" && (
            <div className="flex justify-center pt-2">
              <CompleteLessonButton lessonId={id} completed={completed} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
