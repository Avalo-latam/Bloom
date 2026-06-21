import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getProfile, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { CreateAssignmentDialog } from "@/components/app/create-assignment-dialog";

type SubStatus = "assigned" | "submitted" | "graded" | "returned";

const SUB_BG: Record<SubStatus, string> = {
  assigned: "bg-brand-lemon/50",
  submitted: "bg-brand-sky/50",
  graded: "bg-brand-mint/60",
  returned: "bg-brand-mint/60",
};

function SubBadge({ status, label }: { status: SubStatus; label: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-foreground/70 ${SUB_BG[status]}`}
    >
      {label}
    </span>
  );
}

export default async function HomeworkPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("homework");

  if (profile.role === "student") {
    const { data: subs } = await supabase
      .from("submissions")
      .select("id, status, grade, assignment:assignments(title, due_at)")
      .eq("student_id", profile.id);

    const order = { assigned: 0, submitted: 1, returned: 2, graded: 3 };
    const sorted = [...(subs ?? [])].sort(
      (a, b) => order[a.status as SubStatus] - order[b.status as SubStatus],
    );

    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={t("title")} description={t("subtitleStudent")} />
        <div className="space-y-2">
          {sorted.length === 0 && (
            <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              {t("noHomework")}
            </p>
          )}
          {sorted.map((s) => {
            const a = s.assignment as { title: string; due_at: string | null } | null;
            return (
              <Link
                key={s.id}
                href={`/app/homework/${s.id}`}
                className="glass-card flex items-center justify-between rounded-2xl px-4 py-3 transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <div className="font-medium">{a?.title}</div>
                  {a?.due_at && (
                    <div className="text-xs text-muted-foreground">
                      {t("due")}: {new Date(a.due_at).toLocaleDateString("es-AR")}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {s.status === "graded" && s.grade != null && (
                    <span className="font-heading text-lg font-bold text-primary">
                      {Number(s.grade)}
                    </span>
                  )}
                  <SubBadge status={s.status as SubStatus} label={t(s.status)} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Staff
  await requireStaff();
  let studentsQuery = supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "student")
    .order("full_name");
  if (profile.role === "teacher")
    studentsQuery = studentsQuery.eq("teacher_id", profile.id);

  const [{ data: students }, { data: assignments }] = await Promise.all([
    studentsQuery,
    supabase
      .from("assignments")
      .select(
        "id, title, due_at, created_at, submissions(id, status, student:profiles!submissions_student_id_fkey(full_name, email))",
      )
      .eq("teacher_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const studentOpts = (students ?? []).map((s) => ({
    id: s.id,
    name: s.full_name || s.email || "—",
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("title")} description={t("subtitleStaff")}>
        <CreateAssignmentDialog students={studentOpts} />
      </PageHeader>

      <div className="space-y-4">
        {(assignments ?? []).length === 0 && (
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            {t("noAssignments")}
          </p>
        )}
        {(assignments ?? []).map((a) => {
          const subs = (a.submissions ?? []) as {
            id: string;
            status: SubStatus;
            student: { full_name: string | null; email: string | null } | null;
          }[];
          const done = subs.filter((s) => s.status === "graded").length;
          return (
            <div key={a.id} className="glass-card rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading font-bold">{a.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {done}/{subs.length} {t("graded").toLowerCase()}
                </span>
              </div>
              <div className="space-y-1.5">
                {subs.map((s) => (
                  <Link
                    key={s.id}
                    href={`/app/homework/${s.id}`}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <span>{s.student?.full_name || s.student?.email}</span>
                    <SubBadge status={s.status} label={t(s.status)} />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
