"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  title: z.string().trim().min(2),
  description: z.string().optional().or(z.literal("")),
  levelId: z.string().uuid().optional().or(z.literal("")),
  filePath: z.string().optional().or(z.literal("")),
  url: z.string().optional().or(z.literal("")),
});

export type AddResourceResult = { ok: boolean; error?: string };

export async function addResource(
  _prev: AddResourceResult | null,
  formData: FormData,
): Promise<AddResourceResult> {
  const me = await getProfile();
  if (me.role === "student") return { ok: false, error: "forbidden" };

  const p = schema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    levelId: formData.get("levelId") ?? "",
    filePath: formData.get("filePath") ?? "",
    url: formData.get("url") ?? "",
  });
  if (!p.success) return { ok: false, error: "invalid" };
  if (!p.data.filePath && !p.data.url) return { ok: false, error: "noContent" };

  const supabase = await createClient();
  const { error } = await supabase.from("resources").insert({
    teacher_id: me.id,
    title: p.data.title,
    description: p.data.description || null,
    level_id: p.data.levelId || null,
    kind: p.data.filePath ? "file" : "link",
    file_url: p.data.filePath || null,
    url: p.data.url || null,
  });
  if (error) return { ok: false, error: "save" };

  revalidatePath("/app/resources");
  return { ok: true };
}

export async function deleteResource(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("resources").delete().eq("id", id);
  revalidatePath("/app/resources");
}
