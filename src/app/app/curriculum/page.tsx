import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { LevelBadge } from "@/components/level-badge";
import { CEFR_LADDER, LevelCode } from "@/lib/levels";
import { cn } from "@/lib/utils";

export default async function CurriculumPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("curriculum");
  const tl = await getTranslations("levels");

  const [{ data: levels }, { data: units }, { data: lessons }, { data: myEnrollments }] =
    await Promise.all([
      supabase.from("levels").select("id, code, title, subtitle").order("sort_order"),
      supabase.from("units").select("id, level_id"),
      supabase.from("lessons").select("id, level_id"),
      supabase
        .from("enrollments")
        .select("level_id")
        .eq("student_id", profile.id)
        .eq("status", "active"),
    ]);

  const unitCount = new Map<string, number>();
  (units ?? []).forEach((u) =>
    unitCount.set(u.level_id, (unitCount.get(u.level_id) ?? 0) + 1),
  );
  const lessonCount = new Map<string, number>();
  (lessons ?? []).forEach((l) =>
    lessonCount.set(l.level_id, (lessonCount.get(l.level_id) ?? 0) + 1),
  );
  const myLevelIds = new Set((myEnrollments ?? []).map((e) => e.level_id));

  const cefr = (levels ?? []).filter((l) =>
    CEFR_LADDER.includes(l.code as LevelCode),
  );
  const tracks = (levels ?? []).filter(
    (l) => !CEFR_LADDER.includes(l.code as LevelCode),
  );

  const Card = ({ level }: { level: NonNullable<typeof levels>[number] }) => {
    const mine = myLevelIds.has(level.id);
    return (
      <Link
        href={`/app/curriculum/${level.code}`}
        className={cn(
          "group relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md",
          mine && "ring-2 ring-primary",
        )}
      >
        {mine && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
            {t("yourLevel")}
          </span>
        )}
        <div className="flex items-center gap-3">
          <LevelBadge code={level.code as LevelCode} size="lg" />
          <div>
            <h3 className="font-heading text-lg font-bold leading-tight">
              {tl(level.code)}
            </h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{level.subtitle}</p>
        <div className="mt-auto flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {unitCount.get(level.id) ?? 0} {t("units")} ·{" "}
            {lessonCount.get(level.id) ?? 0} {t("lessons")}
          </span>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    );
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={
          profile.role === "student" ? t("subtitleStudent") : t("subtitleStaff")
        }
      />

      <h2 className="mb-3 font-heading text-lg font-semibold">
        {t("levelsTitle")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cefr.map((level) => (
          <Card key={level.id} level={level} />
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">
        {t("tracks")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((level) => (
          <Card key={level.id} level={level} />
        ))}
      </div>
    </div>
  );
}
