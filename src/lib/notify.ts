import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

type NotifyArgs = {
  userId: string;
  kind:
    | "homework"
    | "grade"
    | "payment"
    | "schedule"
    | "promotion"
    | "message"
    | "system";
  title: string;
  body?: string;
  link?: string;
  /** When set and RESEND_API_KEY is configured, also sends an email. */
  email?: string | null;
};

/**
 * Records an in-app notification and, if RESEND_API_KEY is configured and an
 * email is given, sends a transactional email. Email failures are swallowed so
 * they never block the main action.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function notify(supabase: SupabaseClient<any>, n: NotifyArgs) {
  await supabase.from("notifications").insert({
    user_id: n.userId,
    kind: n.kind,
    title: n.title,
    body: n.body ?? null,
    link: n.link ?? null,
  });

  const key = process.env.RESEND_API_KEY;
  if (key && n.email) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bloom English <hola@bloomenglish.app>",
          to: [n.email],
          subject: n.title,
          html: `<div style="font-family:sans-serif">
            <h2 style="color:#6d5ae6">🌱 ${n.title}</h2>
            <p>${n.body ?? ""}</p>
            ${n.link ? `<p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${n.link}">Abrir en Bloom</a></p>` : ""}
          </div>`,
        }),
      });
    } catch {
      // ignore email errors
    }
  }
}
