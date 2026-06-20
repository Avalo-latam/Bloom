"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Teacher/owner releases a lesson to one or more students (gating). */
export async function releaseLesson(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;

  const lessonId = String(formData.get("lessonId"));
  const studentIds = formData.getAll("studentIds").map(String).filter(Boolean);
  if (!lessonId || studentIds.length === 0) return;

  const supabase = await createClient();
  const rows = studentIds.map((student_id) => ({
    student_id,
    lesson_id: lessonId,
    released_by: me.id,
  }));
  await supabase.from("lesson_access").upsert(rows, {
    onConflict: "student_id,lesson_id",
    ignoreDuplicates: true,
  });

  revalidatePath("/app/curriculum", "layout");
}

/** Remove a student's access to a lesson. */
export async function revokeLesson(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const lessonId = String(formData.get("lessonId"));
  const studentId = String(formData.get("studentId"));
  const supabase = await createClient();
  await supabase
    .from("lesson_access")
    .delete()
    .eq("lesson_id", lessonId)
    .eq("student_id", studentId);
  revalidatePath("/app/curriculum", "layout");
}

/** Student marks a released lesson as completed (or staff on their behalf). */
export async function toggleLessonComplete(formData: FormData) {
  const me = await getProfile();
  const lessonId = String(formData.get("lessonId"));
  const done = formData.get("done") === "true";
  const supabase = await createClient();
  await supabase
    .from("lesson_access")
    .update({ completed_at: done ? new Date().toISOString() : null })
    .eq("lesson_id", lessonId)
    .eq("student_id", me.id);

  // Self-paced students auto-unlock the next module on completion.
  if (done) {
    await supabase.rpc("async_unlock_next", {
      p_student: me.id,
      p_lesson: lessonId,
    });
  }
  revalidatePath("/app/curriculum", "layout");
  revalidatePath("/app/progress");
}
