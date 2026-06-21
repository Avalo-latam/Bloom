"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const receiptSchema = z.object({
  period: z.string().min(1),
  amount: z.coerce.number().positive(),
  kind: z.enum(["individual", "group", "async"]),
  receiptPath: z.string().min(1),
  concept: z.string().optional().or(z.literal("")),
});

export type SubmitResult = { ok: boolean; error?: string };

/** Student records a transfer receipt for review. */
export async function submitReceipt(
  _prev: SubmitResult | null,
  formData: FormData,
): Promise<SubmitResult> {
  const me = await getProfile();
  if (me.role !== "student") return { ok: false, error: "forbidden" };

  const parsed = receiptSchema.safeParse({
    period: formData.get("period"),
    amount: formData.get("amount"),
    kind: formData.get("kind"),
    receiptPath: formData.get("receiptPath"),
    concept: formData.get("concept") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid" };

  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({
    student_id: me.id,
    teacher_id: me.teacher_id,
    kind: parsed.data.kind,
    amount: parsed.data.amount,
    period: parsed.data.period,
    concept: parsed.data.concept || null,
    status: "pendiente",
    receipt_url: parsed.data.receiptPath,
    submitted_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: "save" };

  revalidatePath("/app/payments");
  return { ok: true };
}

/** Teacher/owner verifies a payment; an async payment unlocks the plan. */
export async function verifyPayment(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const paymentId = String(formData.get("paymentId"));
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, student_id, kind")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment) return;

  await supabase
    .from("payments")
    .update({
      status: "verificado",
      reviewed_by: me.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  // A verified async subscription enables the self-paced plan + first module.
  if (payment.kind === "async") {
    const { data: enr } = await supabase
      .from("enrollments")
      .select("level_id")
      .eq("student_id", payment.student_id)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .maybeSingle();
    if (enr?.level_id) {
      await supabase.rpc("enable_async", {
        p_student: payment.student_id,
        p_level: enr.level_id,
      });
    }
  }

  revalidatePath("/app/payments");
}

export async function rejectPayment(formData: FormData) {
  const me = await getProfile();
  if (me.role === "student") return;
  const paymentId = String(formData.get("paymentId"));
  const note = String(formData.get("note") ?? "");
  const supabase = await createClient();
  await supabase
    .from("payments")
    .update({
      status: "rechazado",
      reviewed_by: me.id,
      reviewed_at: new Date().toISOString(),
      note: note || null,
    })
    .eq("id", paymentId);
  revalidatePath("/app/payments");
}
