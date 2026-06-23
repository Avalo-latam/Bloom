"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notify";

export async function sendMessage(formData: FormData) {
  const me = await getProfile();
  const body = String(formData.get("body") ?? "").trim();
  let studentId = String(formData.get("studentId") ?? "");
  if (!body) return;

  const supabase = await createClient();

  // Resolve student + teacher for the thread.
  if (me.role === "student") studentId = me.id;
  if (!studentId) return;

  let teacherId: string | null = null;
  if (me.role === "student") {
    teacherId = me.teacher_id;
  } else {
    const { data: s } = await supabase
      .from("profiles").select("teacher_id").eq("id", studentId).maybeSingle();
    teacherId = s?.teacher_id ?? me.id;
  }

  await supabase.from("messages").insert({
    student_id: studentId,
    teacher_id: teacherId,
    sender_id: me.id,
    body,
  });

  // Notify the other side.
  const recipient = me.role === "student" ? teacherId : studentId;
  if (recipient) {
    await notify(supabase, {
      userId: recipient,
      kind: "message",
      title: `Nuevo mensaje de ${me.full_name ?? "alguien"}`,
      body: body.slice(0, 80),
      link: me.role === "student" ? `/app/messages/${studentId}` : "/app/messages",
    });
  }

  revalidatePath("/app/messages");
  revalidatePath(`/app/messages/${studentId}`);
}

export async function markThreadRead(studentId: string) {
  const me = await getProfile();
  const supabase = await createClient();
  // Mark messages sent by the OTHER person as read.
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("student_id", studentId)
    .neq("sender_id", me.id)
    .is("read_at", null);
}
