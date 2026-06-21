import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Video, Clock } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { markAttendance } from "@/app/app/schedule/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUSES = ["present", "late", "absent", "excused"] as const;

export default async function ClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStaff();
  const supabase = await createClient();
  const t = await getTranslations("schedule");

  const { data: cls } = await supabase
    .from("classes")
    .select(
      "id, title, kind, starts_at, duration_min, meeting_url, recurrence, roster:class_students(student:profiles!class_students_student_id_fkey(id, full_name, email))",
    )
    .eq("id", id)
    .maybeSingle();
  if (!cls) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const { data: attendance } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("class_id", id)
    .eq("session_date", today);
  const statusByStudent = new Map(
    (attendance ?? []).map((a) => [a.student_id, a.status]),
  );

  const roster = (cls.roster as {
    student: { id: string; full_name: string | null; email: string | null } | null;
  }[]).map((r) => r.student).filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
        <Link href="/app/schedule">
          <ArrowLeft className="size-4" />
          {t("title")}
        </Link>
      </Button>

      <div className="glass-card rounded-3xl p-6">
        <h1 className="font-heading text-2xl font-bold">{cls.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 capitalize">
            <Clock className="size-4" />
            {new Date(cls.starts_at).toLocaleString("es-AR")} · {cls.duration_min}′
          </span>
          <span className="capitalize">{t(cls.kind)}</span>
        </div>
        {cls.meeting_url && (
          <Button asChild size="sm" className="mt-4 gap-1.5">
            <a href={cls.meeting_url} target="_blank" rel="noopener noreferrer">
              <Video className="size-4" />
              {t("join")}
            </a>
          </Button>
        )}
      </div>

      <section className="mt-6">
        <h2 className="mb-3 font-heading text-lg font-semibold">
          {t("attendance")} ·{" "}
          <span className="text-sm font-normal text-muted-foreground">
            {new Date(today).toLocaleDateString("es-AR")}
          </span>
        </h2>
        <div className="space-y-2">
          {roster.map((s) => {
            const current = statusByStudent.get(s!.id);
            return (
              <div
                key={s!.id}
                className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
              >
                <span className="font-medium">
                  {s!.full_name || s!.email}
                </span>
                <div className="flex gap-1.5">
                  {STATUSES.map((st) => (
                    <form key={st} action={markAttendance}>
                      <input type="hidden" name="classId" value={id} />
                      <input type="hidden" name="studentId" value={s!.id} />
                      <input type="hidden" name="sessionDate" value={today} />
                      <button
                        name="status"
                        value={st}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                          current === st
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {t(st)}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
