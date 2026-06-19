import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { AddMemberDialog } from "@/components/app/add-member-dialog";
import { LevelBadge } from "@/components/level-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LevelCode } from "@/lib/levels";

export default async function StudentsPage() {
  const me = await requireStaff();
  const supabase = await createClient();
  const t = await getTranslations("students");

  // Students (teachers only see their own; RLS allows staff to read all,
  // so we filter explicitly for teachers).
  let studentsQuery = supabase
    .from("profiles")
    .select("id, full_name, email, is_active, teacher_id")
    .eq("role", "student")
    .order("full_name");
  if (me.role === "teacher") studentsQuery = studentsQuery.eq("teacher_id", me.id);

  const [{ data: students }, { data: teachers }, { data: levels }, { data: enrollments }] =
    await Promise.all([
      studentsQuery,
      supabase.from("profiles").select("id, full_name, email").eq("role", "teacher").order("full_name"),
      supabase.from("levels").select("id, code, subtitle").order("sort_order"),
      supabase.from("enrollments").select("student_id, status, level:levels(code)").eq("status", "active"),
    ]);

  const levelByStudent = new Map<string, LevelCode>();
  (enrollments ?? []).forEach((e) => {
    const code = (e.level as { code: LevelCode } | null)?.code;
    if (code) levelByStudent.set(e.student_id, code);
  });
  const teacherName = new Map<string, string>();
  (teachers ?? []).forEach((tt) =>
    teacherName.set(tt.id, tt.full_name || tt.email || "—"),
  );

  const teacherOptions = (teachers ?? []).map((tt) => ({
    id: tt.id,
    label: tt.full_name || tt.email || "—",
  }));
  const levelOptions = (levels ?? []).map((l) => ({
    id: l.id,
    label: `${l.code} · ${l.subtitle ?? ""}`.trim(),
  }));

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")}>
        <AddMemberDialog
          role={me.role}
          teachers={teacherOptions}
          levels={levelOptions}
        />
      </PageHeader>

      <div className="overflow-hidden rounded-2xl glass-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("level")}</TableHead>
              {me.role === "owner" && <TableHead>{t("teacher")}</TableHead>}
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(students ?? []).length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  {t("noStudents")}
                </TableCell>
              </TableRow>
            )}
            {(students ?? []).map((s) => {
              const lvl = levelByStudent.get(s.id);
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lvl ? (
                      <LevelBadge code={lvl} size="sm" />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t("noLevel")}
                      </span>
                    )}
                  </TableCell>
                  {me.role === "owner" && (
                    <TableCell className="text-sm text-muted-foreground">
                      {s.teacher_id
                        ? teacherName.get(s.teacher_id) ?? t("unassigned")
                        : t("unassigned")}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant={s.is_active ? "secondary" : "outline"}>
                      {s.is_active ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/app/students/${s.id}`}>{t("open")}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {me.role === "owner" && (teachers ?? []).length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-heading text-lg font-semibold">
            {t("teachers")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {(teachers ?? []).map((tt) => (
              <div
                key={tt.id}
                className="rounded-xl glass-card px-4 py-3 text-sm"
              >
                <div className="font-medium">{tt.full_name || "—"}</div>
                <div className="text-xs text-muted-foreground">{tt.email}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
