import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Video, Clock, Repeat } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { CreateClassDialog } from "@/components/app/create-class-dialog";
import { Button } from "@/components/ui/button";

function fmt(dt: string) {
  return new Date(dt).toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SchedulePage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("schedule");

  if (profile.role === "student") {
    const { data: rows } = await supabase
      .from("class_students")
      .select(
        "class:classes(id, title, kind, starts_at, duration_min, meeting_url, recurrence)",
      )
      .eq("student_id", profile.id);

    const classes = (rows ?? [])
      .map((r) => r.class as {
        id: string;
        title: string;
        starts_at: string;
        duration_min: number;
        meeting_url: string | null;
        recurrence: string;
      } | null)
      .filter(Boolean)
      .sort((a, b) => a!.starts_at.localeCompare(b!.starts_at));

    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={t("title")} description={t("subtitleStudent")} />
        {classes.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            {t("noClasses")}
          </p>
        ) : (
          <div className="space-y-3">
            {classes.map((c) => (
              <div key={c!.id} className="glass-card rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-bold">{c!.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 capitalize">
                        <Clock className="size-3" />
                        {fmt(c!.starts_at)} · {c!.duration_min}′
                      </span>
                      {c!.recurrence === "weekly" && (
                        <span className="inline-flex items-center gap-1">
                          <Repeat className="size-3" />
                          {t("weekly")}
                        </span>
                      )}
                    </div>
                  </div>
                  {c!.meeting_url && (
                    <Button asChild size="sm" className="gap-1.5">
                      <a href={c!.meeting_url} target="_blank" rel="noopener noreferrer">
                        <Video className="size-4" />
                        {t("join")}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Staff
  let studentsQuery = supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "student")
    .order("full_name");
  if (profile.role === "teacher")
    studentsQuery = studentsQuery.eq("teacher_id", profile.id);

  const [{ data: students }, { data: classes }] = await Promise.all([
    studentsQuery,
    supabase
      .from("classes")
      .select("id, title, kind, starts_at, duration_min, meeting_url, recurrence, class_students(count)")
      .eq("teacher_id", profile.id)
      .order("starts_at"),
  ]);

  const studentOpts = (students ?? []).map((s) => ({
    id: s.id,
    name: s.full_name || s.email || "—",
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("title")} description={t("subtitleStaff")}>
        <CreateClassDialog students={studentOpts} />
      </PageHeader>
      {(classes ?? []).length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {t("noClasses")}
        </p>
      ) : (
        <div className="space-y-3">
          {(classes ?? []).map((c) => {
            const count =
              (c.class_students as { count: number }[] | null)?.[0]?.count ?? 0;
            return (
              <Link
                key={c.id}
                href={`/app/schedule/${c.id}`}
                className="glass-card flex items-center justify-between rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <h3 className="font-heading font-bold">{c.title}</h3>
                  <div className="mt-1 text-xs capitalize text-muted-foreground">
                    {fmt(c.starts_at)} · {t(c.kind)} · {count} {t("roster").toLowerCase()}
                  </div>
                </div>
                {c.meeting_url && <Video className="size-4 text-primary" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
