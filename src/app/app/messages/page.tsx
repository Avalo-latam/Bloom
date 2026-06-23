import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { Chat, type ChatMessage } from "@/components/app/chat";

export default async function MessagesPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("messages");

  if (profile.role === "student") {
    if (!profile.teacher_id) {
      return (
        <div className="mx-auto max-w-2xl">
          <PageHeader title={t("title")} description={t("subtitleStudent")} />
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            {t("noTeacher")}
          </p>
        </div>
      );
    }
    const { data: msgs } = await supabase
      .from("messages")
      .select("id, body, sender_id, created_at")
      .eq("student_id", profile.id)
      .order("created_at");

    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={t("title")} description={t("subtitleStudent")} />
        <Chat
          studentId={profile.id}
          meId={profile.id}
          messages={(msgs ?? []) as ChatMessage[]}
          emptyText={t("empty")}
        />
      </div>
    );
  }

  // Staff: list conversations
  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "student")
    .eq("teacher_id", profile.id)
    .order("full_name");

  const { data: msgs } = await supabase
    .from("messages")
    .select("student_id, body, sender_id, read_at, created_at")
    .order("created_at", { ascending: false });

  const lastByStudent = new Map<string, { body: string; unread: number }>();
  (msgs ?? []).forEach((m) => {
    const cur = lastByStudent.get(m.student_id) ?? { body: "", unread: 0 };
    if (!cur.body) cur.body = m.body;
    if (m.sender_id !== profile.id && !m.read_at) cur.unread += 1;
    lastByStudent.set(m.student_id, cur);
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("title")} description={t("subtitleStaff")} />
      <div className="space-y-2">
        {(students ?? []).map((s) => {
          const info = lastByStudent.get(s.id);
          return (
            <Link
              key={s.id}
              href={`/app/messages/${s.id}`}
              className="glass-card flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-transform hover:-translate-y-0.5"
            >
              <div className="min-w-0">
                <div className="font-medium">{s.full_name || s.email}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {info?.body || "—"}
                </div>
              </div>
              {info && info.unread > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {info.unread} {t("newMessages")}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
