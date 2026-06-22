import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ExamTaker } from "@/components/app/exam-taker";
import { Button } from "@/components/ui/button";
import type { Quiz } from "@/lib/quiz";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("exams");

  const { data: exam } = await supabase
    .from("exams")
    .select("id, title, description, quiz_id, teacher_id")
    .eq("id", id)
    .maybeSingle();
  if (!exam) notFound();

  const Back = (
    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
      <Link href="/app/exams">
        <ArrowLeft className="size-4" />
        {t("title")}
      </Link>
    </Button>
  );

  // Teacher view: results
  if (profile.role !== "student") {
    const { data: results } = await supabase
      .from("exam_results")
      .select("score, student:profiles!exam_results_student_id_fkey(full_name, email)")
      .eq("exam_id", id)
      .order("score", { ascending: false });
    return (
      <div className="mx-auto max-w-2xl">
        {Back}
        <h1 className="mb-4 font-heading text-2xl font-bold">{exam.title}</h1>
        <h2 className="mb-3 font-heading text-lg font-semibold">{t("results")}</h2>
        {(results ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            {t("notTaken")}
          </p>
        ) : (
          <div className="space-y-2">
            {(results ?? []).map((r, i) => {
              const s = r.student as { full_name: string | null; email: string | null } | null;
              return (
                <div key={i} className="glass-card flex items-center justify-between rounded-2xl px-4 py-3">
                  <span className="font-medium">{s?.full_name || s?.email}</span>
                  <span className="font-heading text-lg font-bold text-primary">
                    {r.score != null ? Number(r.score) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Student view: take or show result
  const [{ data: result }, { data: quiz }] = await Promise.all([
    supabase
      .from("exam_results")
      .select("score")
      .eq("exam_id", id)
      .eq("student_id", profile.id)
      .maybeSingle(),
    supabase
      .from("quizzes")
      .select("id, title, description, questions:quiz_questions(id, kind, prompt, media_url, data, explanation, points, sort_order)")
      .eq("id", exam.quiz_id!)
      .maybeSingle(),
  ]);

  const quizData: Quiz | null = quiz
    ? {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: [...((quiz.questions as Quiz["questions"]) ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      }
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      {Back}
      <div className="glass-card mb-5 rounded-3xl p-6">
        <h1 className="font-heading text-2xl font-bold">{exam.title}</h1>
        {exam.description && (
          <p className="mt-1.5 text-muted-foreground">{exam.description}</p>
        )}
        {result?.score != null && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-mint/40 px-3 py-1.5 text-sm">
            {t("yourScore")}:{" "}
            <span className="font-heading text-lg font-bold text-primary">
              {Number(result.score)}
            </span>
          </p>
        )}
      </div>
      {quizData && <ExamTaker examId={id} quiz={quizData} />}
    </div>
  );
}
