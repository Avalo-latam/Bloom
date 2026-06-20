"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const createSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: z.enum(["student", "teacher"]),
  teacherId: z.string().uuid().optional().or(z.literal("")),
  levelId: z.string().uuid().optional().or(z.literal("")),
});

export type CreateMemberResult =
  | { ok: true; tempPassword: string; email: string }
  | { ok: false; error: string };

function tempPassword() {
  // Friendly but strong-ish temporary password.
  const part = Math.random().toString(36).slice(2, 8);
  return `Bloom-${part}${Math.floor(10 + Math.random() * 89)}`;
}

export async function createMember(
  _prev: CreateMemberResult | null,
  formData: FormData,
): Promise<CreateMemberResult> {
  const me = await getProfile();
  if (me.role === "student") return { ok: false, error: "forbidden" };

  const parsed = createSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    role: formData.get("role"),
    teacherId: formData.get("teacherId") ?? "",
    levelId: formData.get("levelId") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { fullName, email, role, teacherId, levelId } = parsed.data;

  // Only the owner can create teachers; a teacher only creates students.
  const finalRole = me.role === "owner" ? role : "student";
  // Who the student belongs to: chosen teacher (owner) or the caller (teacher).
  const assignedTeacher =
    finalRole === "student"
      ? me.role === "owner"
        ? teacherId || me.id
        : me.id
      : null;

  const admin = createAdminClient();
  const password = tempPassword();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: finalRole },
  });

  if (createErr || !created.user) {
    return {
      ok: false,
      error: createErr?.message.includes("already")
        ? "exists"
        : "createFailed",
    };
  }

  const userId = created.user.id;

  // The handle_new_user trigger created the profile; fill in the rest.
  await admin
    .from("profiles")
    .update({
      full_name: fullName,
      role: finalRole,
      teacher_id: assignedTeacher,
    })
    .eq("id", userId);

  if (finalRole === "student" && levelId) {
    await admin.from("enrollments").insert({
      student_id: userId,
      teacher_id: assignedTeacher,
      level_id: levelId,
      status: "active",
    });
  }

  revalidatePath("/app/students");
  return { ok: true, tempPassword: password, email };
}

const reassignSchema = z.object({
  studentId: z.string().uuid(),
  teacherId: z.string().uuid(),
});

export async function reassignTeacher(formData: FormData) {
  const me = await getProfile();
  if (me.role !== "owner") return;
  const parsed = reassignSchema.safeParse({
    studentId: formData.get("studentId"),
    teacherId: formData.get("teacherId"),
  });
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ teacher_id: parsed.data.teacherId })
    .eq("id", parsed.data.studentId);
  revalidatePath("/app/students");
}

export async function updateStudentNotes(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const studentId = String(formData.get("studentId"));
  const notes = String(formData.get("notes") ?? "");
  const supabase = await createClient();
  await supabase.from("profiles").update({ notes }).eq("id", studentId);
  revalidatePath(`/app/students/${studentId}`);
}

/** Enable the self-paced async plan for a student in a level (staff only). */
export async function enableAsyncPlan(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const studentId = String(formData.get("studentId"));
  const levelId = String(formData.get("levelId"));
  if (!studentId || !levelId) return;
  const supabase = await createClient();
  await supabase.rpc("enable_async", {
    p_student: studentId,
    p_level: levelId,
  });
  revalidatePath(`/app/students/${studentId}`);
}

export async function setMemberActive(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_active: active }).eq("id", id);
  revalidatePath("/app/students");
}
