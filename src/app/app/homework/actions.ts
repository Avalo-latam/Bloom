"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const createSchema = z.object({
  title: z.string().trim().min(2),
  instructions: z.string().optional().or(z.literal("")),
  dueAt: z.string().optional().or(z.literal("")),
});

export type CreateAssignmentResult = { ok: boolean; error?: string };

/** Teacher creates an assignment and assigns it to selected students. */
export async function createAssignment(
  _prev: CreateAssignmentResult | null,
  formData: FormData,
): Promise<CreateAssignmentResult> {
  const me = await getProfile();
  if (me.role === "student") return { ok: false, error: "forbidden" };

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    instructions: formData.get("instructions") ?? "",
    dueAt: formData.get("dueAt") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid" };

  const studentIds = formData.getAll("studentIds").map(String).filter(Boolean);
  if (studentIds.length === 0) return { ok: false, error: "noStudents" };

  const supabase = await createClient();
  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      teacher_id: me.id,
      title: parsed.data.title,
      instructions: parsed.data.instructions || null,
      due_at: parsed.data.dueAt ? new Date(parsed.data.dueAt).toISOString() : null,
    })
    .select("id")
    .single();
  if (error || !assignment) return { ok: false, error: "save" };

  await supabase.from("submissions").insert(
    studentIds.map((student_id) => ({
      assignment_id: assignment.id,
      student_id,
      status: "assigned" as const,
    })),
  );

  revalidatePath("/app/homework");
  return { ok: true };
}

const submitSchema = z.object({
  submissionId: z.string().uuid(),
  text: z.string().optional().or(z.literal("")),
  filePath: z.string().optional().or(z.literal("")),
});

/** Student submits their work. */
export async function submitHomework(formData: FormData) {
  const me = await getProfile();
  const parsed = submitSchema.safeParse({
    submissionId: formData.get("submissionId"),
    text: formData.get("text") ?? "",
    filePath: formData.get("filePath") ?? "",
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("submissions")
    .update({
      text_answer: parsed.data.text || null,
      file_url: parsed.data.filePath || null,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.submissionId)
    .eq("student_id", me.id);

  revalidatePath(`/app/homework/${parsed.data.submissionId}`);
  revalidatePath("/app/homework");
}

/** Teacher grades a submission with a mark + written feedback. */
export async function gradeSubmission(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const submissionId = String(formData.get("submissionId"));
  const grade = formData.get("grade");
  const feedback = String(formData.get("feedback") ?? "");

  const supabase = await createClient();
  await supabase
    .from("submissions")
    .update({
      grade: grade ? Number(grade) : null,
      feedback: feedback || null,
      status: "graded",
      graded_by: me.id,
      graded_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  revalidatePath(`/app/homework/${submissionId}`);
  revalidatePath("/app/homework");
  revalidatePath("/app/grades");
}
