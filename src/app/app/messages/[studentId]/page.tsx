import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Chat, type ChatMessage } from "@/components/app/chat";
import { Button } from "@/components/ui/button";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const me = await requireStaff();
  const supabase = await createClient();
  const t = await getTranslations("messages");

  const { data: student } = await supabase
    .from("profiles").select("full_name, email").eq("id", studentId).maybeSingle();
  if (!student) notFound();

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, body, sender_id, created_at")
    .eq("student_id", studentId)
    .order("created_at");

  return (
    <div className="mx-auto max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 gap-1.5">
        <Link href="/app/messages"><ArrowLeft className="size-4" />{t("title")}</Link>
      </Button>
      <h1 className="mb-4 font-heading text-xl font-bold">
        {student.full_name || student.email}
      </h1>
      <Chat
        studentId={studentId}
        meId={me.id}
        messages={(msgs ?? []) as ChatMessage[]}
        emptyText={t("empty")}
      />
    </div>
  );
}
