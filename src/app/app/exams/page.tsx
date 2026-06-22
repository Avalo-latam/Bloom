import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { CreateExamDialog } from "@/components/app/create-exam-dialog";

export default async function ExamsPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("exams");

  if (profile.role === "student") {
    const { data: enr } = await supabase
      .from("enrollments")
      .select("level_id")
      .eq("student_id", profile.id)
      .eq("status", "active")
      .maybeSingle();

    let q = supabase.from("exams").select("id, title, description, level_id");
    if (enr?.level_id) q = q.or(`level_id.eq.${enr.level_id},level_id.is.null`);
    const [{ data: exams }, { data: results }] = await Promise.all([
      q,
      supabase
        .from("exam_results")
        .select("exam_id, score")
        .eq("student_id", profile.id),
    ]);
    const scoreByExam = new Map(
      (results ?? []).map((r) => [r.exam_id, r.score]),
    );

    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={t("title")} description={t("subtitleStudent")} />
        {(exams ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            {t("noExams")}
          </p>
        ) : (
          <div className="space-y-2">
            {(exams ?? []).map((e) => {
              const score = scoreByExam.get(e.id);
              return (
                <Link
                  key={e.id}
                  href={`/app/exams/${e.id}`}
                  className="glass-card flex items-center justify-between rounded-2xl px-4 py-3 transition-transform hover:-translate-y-0.5"
                >
                  <div>
                    <div className="font-medium">{e.title}</div>
                    {e.description && (
                      <div className="text-xs text-muted-foreground">
                        {e.description}
                      </div>
                    )}
                  </div>
                  {score != null ? (
                    <span className="font-heading text-lg font-bold text-primary">
                      {Number(score)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-brand-lemon/50 px-2.5 py-0.5 text-xs font-medium text-foreground/70">
                      {t("notTaken")}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Staff
  const [{ data: exams }, { data: quizzes }, { data: levels }] = await Promise.all([
    supabase
      .from("exams")
      .select("id, title, exam_results(count)")
      .eq("teacher_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase.from("quizzes").select("id, title").eq("is_shared", true).order("title").limit(120),
    supabase.from("levels").select("id, code").order("sort_order"),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("title")} description={t("subtitleStaff")}>
        <CreateExamDialog
          quizzes={(quizzes ?? []).map((q) => ({ id: q.id, label: q.title }))}
          levels={(levels ?? []).map((l) => ({ id: l.id, label: l.code }))}
        />
      </PageHeader>
      {(exams ?? []).length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {t("noExams")}
        </p>
      ) : (
        <div className="space-y-2">
          {(exams ?? []).map((e) => {
            const count =
              (e.exam_results as { count: number }[] | null)?.[0]?.count ?? 0;
            return (
              <Link
                key={e.id}
                href={`/app/exams/${e.id}`}
                className="glass-card flex items-center justify-between rounded-2xl px-4 py-3 transition-transform hover:-translate-y-0.5"
              >
                <span className="font-medium">{e.title}</span>
                <span className="text-sm text-muted-foreground">
                  {count} {t("done").toLowerCase()}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
