import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Clock, Play, Lock } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/level-badge";
import { BLOCK_META, type BlockKind, type BlockContent } from "@/lib/blocks";
import type { LevelCode } from "@/lib/levels";
import { cn } from "@/lib/utils";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("curriculum");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, objective, duration_min, level:levels(code, subtitle), unit:units(title)")
    .eq("id", id)
    .maybeSingle();
  if (!lesson) notFound();

  // Students need an explicit release; staff always have access.
  let locked = false;
  if (profile.role === "student") {
    const { data: access } = await supabase
      .from("lesson_access")
      .select("lesson_id")
      .eq("lesson_id", id)
      .eq("student_id", profile.id)
      .maybeSingle();
    locked = !access;
  }

  const { data: blocks } = await supabase
    .from("lesson_blocks")
    .select("id, kind, title, duration_min, sort_order, content")
    .eq("lesson_id", id)
    .order("sort_order");

  const level = lesson.level as { code: LevelCode; subtitle: string } | null;
  const unit = lesson.unit as { title: string } | null;
  const totalMin = (blocks ?? []).reduce((s, b) => s + b.duration_min, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
        <Link href={level ? `/app/curriculum/${level.code}` : "/app/curriculum"}>
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
      </Button>

      <div className="flex flex-col gap-4 rounded-2xl glass-card p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {level && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LevelBadge code={level.code} size="sm" />
              {unit?.title}
            </div>
          )}
          <h1 className="font-heading text-2xl font-bold">{lesson.title}</h1>
          {lesson.objective && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {t("objective")}:
              </span>{" "}
              {lesson.objective}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {totalMin} {t("minutes")} · {(blocks ?? []).length} {t("blocks")}
          </div>
        </div>
        {!locked && (
          <Button asChild size="lg" className="gap-2">
            <Link href={`/app/curriculum/lesson/${id}/classroom`}>
              <Play className="size-4" />
              {t("openClassroom")}
            </Link>
          </Button>
        )}
      </div>

      {locked ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <Lock className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">{t("lockedHint")}</p>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="mb-4 font-heading text-lg font-semibold">
            {t("blocks")}
          </h2>
          <ol className="relative space-y-3 border-l-2 border-dashed border-border pl-6">
            {(blocks ?? []).map((block) => {
              const meta = BLOCK_META[block.kind as BlockKind];
              const Icon = meta?.icon ?? Clock;
              const content = (block.content ?? {}) as BlockContent;
              return (
                <li key={block.id} className="relative">
                  <span
                    className="absolute -left-[2.1rem] top-1 inline-flex size-7 items-center justify-center rounded-full ring-4 ring-background"
                    style={{ backgroundColor: `var(--${meta?.color ?? "muted"})` }}
                  >
                    <Icon className="size-3.5 text-foreground/70" />
                  </span>
                  <div className="rounded-xl glass-card p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{block.title}</h3>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {block.duration_min}′
                      </span>
                    </div>
                    {content.guide && (
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {content.guide}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
