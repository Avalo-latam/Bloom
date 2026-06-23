"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function staff() {
  const me = await getProfile();
  return me.role !== "student";
}

export async function updateUnit(formData: FormData) {
  if (!(await staff())) return;
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const supabase = await createClient();
  await supabase.from("units").update({ title }).eq("id", id);
  revalidatePath("/app/curriculum", "layout");
}

export async function updateLesson(formData: FormData) {
  if (!(await staff())) return;
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const objective = String(formData.get("objective") ?? "").trim();
  if (!title) return;
  const supabase = await createClient();
  await supabase.from("lessons").update({ title, objective: objective || null }).eq("id", id);
  revalidatePath(`/app/curriculum/lesson/${id}`);
  revalidatePath("/app/curriculum", "layout");
}

/** Edit a block's text fields (title, explanation HTML, examples, teacher note). */
export async function updateBlock(formData: FormData) {
  if (!(await staff())) return;
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const html = String(formData.get("html") ?? "").trim();
  const guide = String(formData.get("guide") ?? "").trim();
  const examplesRaw = String(formData.get("examples") ?? "").trim();
  const lessonId = String(formData.get("lessonId") ?? "");

  const supabase = await createClient();
  const { data: block } = await supabase
    .from("lesson_blocks").select("content").eq("id", id).maybeSingle();
  const content = { ...((block?.content as Record<string, unknown>) ?? {}) };
  content.html = html || undefined;
  content.guide = guide || undefined;
  content.examples = examplesRaw
    ? examplesRaw.split("\n").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const patch: Record<string, unknown> = { content };
  if (title) patch.title = title;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await supabase.from("lesson_blocks").update(patch as any).eq("id", id);
  if (lessonId) revalidatePath(`/app/curriculum/lesson/${lessonId}`);
}
