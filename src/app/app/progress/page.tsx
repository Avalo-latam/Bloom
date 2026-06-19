import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { GrowthGarden } from "@/components/brand/illustrations";
import { LevelBadge } from "@/components/level-badge";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/motion";
import type { LevelCode } from "@/lib/levels";

export default async function ProgressPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("progress");

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("level:levels(id, code, subtitle)")
    .eq("student_id", profile.id)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .maybeSingle();

  const level = enrollment?.level as
    | { id: string; code: LevelCode; subtitle: string }
    | null;

  if (!level) {
    return (
      <div>
        <PageHeader title={t("title")} description={t("subtitle")} />
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {t("noLevel")}
        </div>
      </div>
    );
  }

  const [{ data: lessons }, { data: access }, { data: units }] = await Promise.all([
    supabase.from("lessons").select("id, unit_id").eq("level_id", level.id),
    supabase
      .from("lesson_access")
      .select("lesson_id, completed_at")
      .eq("student_id", profile.id),
    supabase
      .from("units")
      .select("id, title, sort_order")
      .eq("level_id", level.id)
      .order("sort_order"),
  ]);

  const lessonList = lessons ?? [];
  const total = lessonList.length;
  const completedIds = new Set(
    (access ?? []).filter((a) => a.completed_at).map((a) => a.lesson_id),
  );
  const releasedIds = new Set((access ?? []).map((a) => a.lesson_id));
  const completed = lessonList.filter((l) => completedIds.has(l.id)).length;
  const released = lessonList.filter((l) => releasedIds.has(l.id)).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  const unitRows = (units ?? []).map((u) => {
    const inUnit = lessonList.filter((l) => l.unit_id === u.id);
    const done = inUnit.filter((l) => completedIds.has(l.id)).length;
    return { id: u.id, title: u.title, total: inUnit.length, done };
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("title")} description={t("subtitle")}>
        <LevelBadge code={level.code} size="lg" />
      </PageHeader>

      {/* Garden */}
      <Reveal className="overflow-hidden rounded-3xl border bg-gradient-to-b from-brand-sky/15 to-brand-mint/15 p-6">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-heading text-lg font-semibold">{t("garden")}</h2>
          <span className="text-sm text-muted-foreground">
            {completed} {t("of")} {total} · {pct}%
          </span>
        </div>
        <GrowthGarden completed={completed} total={total} className="max-h-52" />
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {completed === 0 ? t("start") : t("keepGrowing")}
        </p>
      </Reveal>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { v: completed, l: t("completed") },
          { v: released, l: t("released") },
          { v: `${pct}%`, l: t("completion") },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl glass-card p-4 text-center">
            <div className="font-heading text-2xl font-extrabold text-primary">
              {s.v}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Per-unit */}
      <section className="mt-8">
        <h2 className="mb-3 font-heading text-lg font-semibold">{t("byUnit")}</h2>
        <div className="space-y-3">
          {unitRows.map((u) => (
            <div key={u.id} className="rounded-2xl glass-card p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{u.title}</span>
                <span className="text-muted-foreground">
                  {u.done}/{u.total}
                </span>
              </div>
              <Progress value={u.total ? (u.done / u.total) * 100 : 0} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
