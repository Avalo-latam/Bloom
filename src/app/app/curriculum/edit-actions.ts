"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function staff() {
  const me = await getProfile();
  return me.role !== "student";
}

/** Add a new lesson to a unit (teacher's own class). */
export async function createLesson(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const unitId = String(formData.get("unitId"));
  const levelId = String(formData.get("levelId"));
  const title = String(formData.get("title") ?? "").trim();
  const objective = String(formData.get("objective") ?? "").trim();
  if (!unitId || !levelId || !title) return;

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("lessons").select("sort_order").eq("unit_id", unitId)
    .order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const sort = (last?.sort_order ?? 0) + 1;

  const { data: lesson } = await supabase
    .from("lessons")
    .insert({
      unit_id: unitId,
      level_id: levelId,
      title,
      objective: objective || null,
      sort_order: sort,
      created_by: me.id,
    })
    .select("id")
    .single();

  // Start with one explanation block so the class isn't empty.
  if (lesson) {
    await supabase.from("lesson_blocks").insert({
      lesson_id: lesson.id,
      kind: "presentation",
      title: "Explanation",
      duration_min: 15,
      sort_order: 0,
      content: { html: "<p>Escribí acá la explicación de la clase.</p>" },
    });
  }
  revalidatePath("/app/curriculum", "layout");
}

export async function deleteLesson(formData: FormData) {
  if (!(await staff())) return;
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", id);
  revalidatePath("/app/curriculum", "layout");
}

const BLOCK_KINDS = ["warmup", "review", "presentation", "practice", "speaking", "game", "wrapup"];

/** Add a block to a lesson. */
export async function createBlock(formData: FormData) {
  if (!(await staff())) return;
  const lessonId = String(formData.get("lessonId"));
  const kind = String(formData.get("kind"));
  const title = String(formData.get("title") ?? "").trim() || "New block";
  if (!lessonId || !BLOCK_KINDS.includes(kind)) return;

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("lesson_blocks").select("sort_order").eq("lesson_id", lessonId)
    .order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const sort = (last?.sort_order ?? -1) + 1;

  await supabase.from("lesson_blocks").insert({
    lesson_id: lessonId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kind: kind as any,
    title,
    duration_min: 10,
    sort_order: sort,
    content: { html: "" },
  });
  revalidatePath(`/app/curriculum/lesson/${lessonId}`);
}

export async function deleteBlock(formData: FormData) {
  if (!(await staff())) return;
  const id = String(formData.get("id"));
  const lessonId = String(formData.get("lessonId"));
  const supabase = await createClient();
  await supabase.from("lesson_blocks").delete().eq("id", id);
  revalidatePath(`/app/curriculum/lesson/${lessonId}`);
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
