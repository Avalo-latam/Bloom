import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";

export default async function GradesPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("grades");

  if (profile.role === "student") {
    const [{ data: subs }, { data: entries }] = await Promise.all([
      supabase
        .from("submissions")
        .select("id, grade, feedback, graded_at, assignment:assignments(title)")
        .eq("student_id", profile.id)
        .eq("status", "graded"),
      supabase
        .from("grade_entries")
        .select("id, title, score, max_score, feedback, created_at, category")
        .eq("student_id", profile.id),
    ]);

    const items = [
      ...(subs ?? []).map((s) => ({
        id: s.id,
        title: (s.assignment as { title: string } | null)?.title ?? t("homework"),
        score: s.grade != null ? Number(s.grade) : null,
        max: 100,
        feedback: s.feedback,
        date: s.graded_at,
      })),
      ...(entries ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        score: e.score != null ? Number(e.score) : null,
        max: Number(e.max_score),
        feedback: e.feedback,
        date: e.created_at,
      })),
    ].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

    const scored = items.filter((i) => i.score != null);
    const avg = scored.length
      ? Math.round(scored.reduce((s, i) => s + (i.score! / i.max) * 100, 0) / scored.length)
      : null;

    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={t("title")} description={t("subtitleStudent")} />
        {avg != null && (
          <div className="mb-5 glass-card flex items-center justify-between rounded-3xl p-6">
            <span className="font-heading text-lg font-semibold">
              {t("average")}
            </span>
            <span className="font-heading text-4xl font-extrabold text-primary">
              {avg}
            </span>
          </div>
        )}
        <div className="space-y-2">
          {items.length === 0 && (
            <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              {t("noGrades")}
            </p>
          )}
          {items.map((i) => (
            <div key={i.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{i.title}</span>
                <span className="font-heading text-lg font-bold text-primary">
                  {i.score != null ? `${i.score}/${i.max}` : "—"}
                </span>
              </div>
              {i.feedback && (
                <p className="mt-1.5 text-sm text-muted-foreground">{i.feedback}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Staff gradebook: per-student averages.
  let studentsQuery = supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "student")
    .order("full_name");
  if (profile.role === "teacher")
    studentsQuery = studentsQuery.eq("teacher_id", profile.id);
  const { data: students } = await studentsQuery;

  const { data: graded } = await supabase
    .from("submissions")
    .select("student_id, grade")
    .eq("status", "graded")
    .not("grade", "is", null);

  const byStudent = new Map<string, number[]>();
  (graded ?? []).forEach((g) => {
    if (g.grade == null) return;
    const arr = byStudent.get(g.student_id) ?? [];
    arr.push(Number(g.grade));
    byStudent.set(g.student_id, arr);
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("title")} description={t("subtitleStaff")} />
      <div className="space-y-2">
        {(students ?? []).map((s) => {
          const grades = byStudent.get(s.id) ?? [];
          const avg = grades.length
            ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
            : null;
          return (
            <Link
              key={s.id}
              href={`/app/students/${s.id}`}
              className="glass-card flex items-center justify-between rounded-2xl px-4 py-3 transition-transform hover:-translate-y-0.5"
            >
              <div>
                <div className="font-medium">{s.full_name || s.email}</div>
                <div className="text-xs text-muted-foreground">
                  {grades.length} {t("graded").toLowerCase()}
                </div>
              </div>
              <span className="font-heading text-2xl font-bold text-primary">
                {avg ?? "—"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
