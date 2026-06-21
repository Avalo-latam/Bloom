"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const createSchema = z.object({
  title: z.string().trim().min(2),
  kind: z.enum(["individual", "group"]),
  startsAt: z.string().min(1),
  durationMin: z.coerce.number().int().positive().default(60),
  meetingUrl: z.string().optional().or(z.literal("")),
  recurrence: z.enum(["none", "weekly"]).default("weekly"),
});

export type CreateClassResult = { ok: boolean; error?: string };

export async function createClass(
  _prev: CreateClassResult | null,
  formData: FormData,
): Promise<CreateClassResult> {
  const me = await getProfile();
  if (me.role === "student") return { ok: false, error: "forbidden" };

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    kind: formData.get("kind"),
    startsAt: formData.get("startsAt"),
    durationMin: formData.get("durationMin") || 60,
    meetingUrl: formData.get("meetingUrl") ?? "",
    recurrence: formData.get("recurrence") || "weekly",
  });
  if (!parsed.success) return { ok: false, error: "invalid" };

  const studentIds = formData.getAll("studentIds").map(String).filter(Boolean);

  const supabase = await createClient();
  const { data: cls, error } = await supabase
    .from("classes")
    .insert({
      teacher_id: me.id,
      title: parsed.data.title,
      kind: parsed.data.kind,
      starts_at: new Date(parsed.data.startsAt).toISOString(),
      duration_min: parsed.data.durationMin,
      meeting_url: parsed.data.meetingUrl || null,
      recurrence: parsed.data.recurrence,
    })
    .select("id")
    .single();
  if (error || !cls) return { ok: false, error: "save" };

  if (studentIds.length) {
    await supabase.from("class_students").insert(
      studentIds.map((student_id) => ({ class_id: cls.id, student_id })),
    );
    // Notify the students.
    await supabase.from("notifications").insert(
      studentIds.map((user_id) => ({
        user_id,
        kind: "schedule" as const,
        title: parsed.data.title,
        body: new Date(parsed.data.startsAt).toLocaleString("es-AR"),
        link: "/app/schedule",
      })),
    );
  }

  revalidatePath("/app/schedule");
  return { ok: true };
}

export async function markAttendance(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const classId = String(formData.get("classId"));
  const studentId = String(formData.get("studentId"));
  const status = String(formData.get("status")) as
    | "present"
    | "absent"
    | "late"
    | "excused";
  const sessionDate = String(formData.get("sessionDate"));

  const supabase = await createClient();
  await supabase.from("attendance").upsert(
    {
      class_id: classId,
      student_id: studentId,
      status,
      session_date: sessionDate,
    },
    { onConflict: "class_id,student_id,session_date" },
  );
  revalidatePath(`/app/schedule/${classId}`);
}

export async function deleteClass(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const classId = String(formData.get("classId"));
  const supabase = await createClient();
  await supabase.from("classes").delete().eq("id", classId).eq("teacher_id", me.id);
  revalidatePath("/app/schedule");
}
