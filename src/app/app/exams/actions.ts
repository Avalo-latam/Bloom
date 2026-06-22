"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const createSchema = z.object({
  title: z.string().trim().min(2),
  levelId: z.string().uuid().optional().or(z.literal("")),
  quizId: z.string().uuid(),
  description: z.string().optional().or(z.literal("")),
});

export type CreateExamResult = { ok: boolean; error?: string };

export async function createExam(
  _prev: CreateExamResult | null,
  formData: FormData,
): Promise<CreateExamResult> {
  const me = await getProfile();
  if (me.role === "student") return { ok: false, error: "forbidden" };

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    levelId: formData.get("levelId") ?? "",
    quizId: formData.get("quizId"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid" };

  const supabase = await createClient();
  const { error } = await supabase.from("exams").insert({
    teacher_id: me.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    kind: "quiz",
    quiz_id: parsed.data.quizId,
    level_id: parsed.data.levelId || null,
  });
  if (error) return { ok: false, error: "save" };

  revalidatePath("/app/exams");
  return { ok: true };
}

/** Student records their exam score (auto-graded quiz). */
export async function submitExamResult(examId: string, score: number) {
  const me = await getProfile();
  if (me.role !== "student") return;
  const supabase = await createClient();
  await supabase.from("exam_results").upsert(
    {
      exam_id: examId,
      student_id: me.id,
      score,
      max_score: 100,
      taken_at: new Date().toISOString(),
    },
    { onConflict: "exam_id,student_id" },
  );
  revalidatePath(`/app/exams/${examId}`);
  revalidatePath("/app/exams");
  revalidatePath("/app/grades");
}
