"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updatePricing(formData: FormData) {
  const me = await getProfile();
  if (me.role !== "owner") return;

  const supabase = await createClient();
  const { data: row } = await supabase.from("pricing").select("id").limit(1).maybeSingle();

  const patch = {
    alias: String(formData.get("alias") ?? "bloom.mp"),
    individual_price: Number(formData.get("individual_price") ?? 20000),
    group_price: Number(formData.get("group_price") ?? 15000),
    async_price: Number(formData.get("async_price") ?? 20000),
    updated_at: new Date().toISOString(),
  };

  if (row) await supabase.from("pricing").update(patch).eq("id", row.id);
  else await supabase.from("pricing").insert(patch);

  revalidatePath("/app/settings");
  revalidatePath("/app/payments");
}
