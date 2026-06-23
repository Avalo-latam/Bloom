import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Lock, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { LevelBadge } from "@/components/level-badge";
import { ReleaseLessonDialog } from "@/components/app/release-lesson-dialog";
import { EditUnitDialog, AddLessonDialog } from "@/components/app/curriculum-edit";
import { deleteLesson } from "@/app/app/curriculum/edit-actions";
import { Button } from "@/components/ui/button";
import { LEVEL_CODES, LevelCode } from "@/lib/levels";
import { cn } from "@/lib/utils";

export default async function LevelPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!LEVEL_CODES.includes(code as LevelCode)) notFound();
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("curriculum");
  const tl = await getTranslations("levels");

  const { data: level } = await supabase
    .from("levels")
    .select("id, code, title, subtitle, description, cefr_can_do")
    .eq("code", code as LevelCode)
    .maybeSingle();
  if (!level) notFound();

  const [{ data: units }, { data: lessons }] = await Promise.all([
    supabase.from("units").select("id, title, sort_order").eq("level_id", level.id).order("sort_order"),
    supabase
      .from("lessons")
      .select("id, unit_id, title, objective, duration_min, sort_order")
      .eq("level_id", level.id)
      .order("sort_order"),
  ]);

  const lessonIds = (lessons ?? []).map((l) => l.id);
  const isStaff = profile.role !== "student";

  // Access maps.
  const releasedToMe = new Map<string, { completed: boolean }>();
  const releasedSets = new Map<string, Set<string>>(); // lessonId -> studentIds
  let students: { id: string; name: string }[] = [];

  if (isStaff) {
    let sQuery = supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "student")
      .order("full_name");
    if (profile.role === "teacher") sQuery = sQuery.eq("teacher_id", profile.id);
    const { data: sData } = await sQuery;
    students = (sData ?? []).map((s) => ({
      id: s.id,
      name: s.full_name || s.email || "—",
    }));

    if (lessonIds.length) {
      const { data: access } = await supabase
        .from("lesson_access")
        .select("lesson_id, student_id")
        .in("lesson_id", lessonIds);
      (access ?? []).forEach((a) => {
        if (!releasedSets.has(a.lesson_id)) releasedSets.set(a.lesson_id, new Set());
        releasedSets.get(a.lesson_id)!.add(a.student_id);
      });
    }
  } else if (lessonIds.length) {
    const { data: access } = await supabase
      .from("lesson_access")
      .select("lesson_id, completed_at")
      .eq("student_id", profile.id)
      .in("lesson_id", lessonIds);
    (access ?? []).forEach((a) =>
      releasedToMe.set(a.lesson_id, { completed: !!a.completed_at }),
    );
  }

  const lessonsByUnit = new Map<string, typeof lessons>();
  (lessons ?? []).forEach((l) => {
    if (!lessonsByUnit.has(l.unit_id)) lessonsByUnit.set(l.unit_id, []);
    lessonsByUnit.get(l.unit_id)!.push(l);
  });

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
        <Link href="/app/curriculum">
          <ArrowLeft className="size-4" />
          {t("title")}
        </Link>
      </Button>

      <PageHeader title={tl(level.code)} description={level.description ?? level.subtitle ?? ""}>
        <LevelBadge code={level.code as LevelCode} size="lg" />
      </PageHeader>

      <div className="space-y-8">
        {(units ?? []).map((unit, i) => (
          <section key={unit.id}>
            <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-secondary text-sm text-secondary-foreground">
                {i + 1}
              </span>
              {unit.title}
              {isStaff && <EditUnitDialog id={unit.id} title={unit.title} />}
            </h2>
            <div className="overflow-hidden rounded-2xl glass-card">
              {(lessonsByUnit.get(unit.id) ?? []).map((lesson, idx, arr) => {
                const access = releasedToMe.get(lesson.id);
                const released = isStaff ? true : !!access;
                const completed = access?.completed ?? false;
                const relSet = releasedSets.get(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      idx < arr.length - 1 && "border-b",
                      !released && "opacity-70",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                        completed
                          ? "bg-accent text-accent-foreground"
                          : released
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {completed ? (
                        <CheckCircle2 className="size-4" />
                      ) : !released ? (
                        <Lock className="size-3.5" />
                      ) : (
                        lesson.sort_order
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{lesson.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {lesson.duration_min} {t("minutes")}
                        {lesson.objective && (
                          <span className="hidden truncate sm:inline">
                            · {lesson.objective}
                          </span>
                        )}
                      </div>
                    </div>

                    {isStaff ? (
                      <div className="flex items-center gap-2">
                        <ReleaseLessonDialog
                          lessonId={lesson.id}
                          lessonTitle={lesson.title}
                          releasedCount={relSet?.size ?? 0}
                          students={students.map((s) => ({
                            ...s,
                            released: relSet?.has(s.id) ?? false,
                          }))}
                        />
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/app/curriculum/lesson/${lesson.id}`}>
                            <ChevronRight className="size-4" />
                          </Link>
                        </Button>
                        <form action={deleteLesson}>
                          <input type="hidden" name="id" value={lesson.id} />
                          <Button type="submit" size="icon" variant="ghost" className="size-7 text-destructive" aria-label="delete">
                            ✕
                          </Button>
                        </form>
                      </div>
                    ) : released ? (
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/app/curriculum/lesson/${lesson.id}`}>
                          {t("openLesson")}
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t("locked")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {isStaff && (
              <div className="mt-2">
                <AddLessonDialog unitId={unit.id} levelId={level.id} />
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
