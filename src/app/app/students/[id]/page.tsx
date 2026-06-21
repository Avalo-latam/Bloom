import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  updateStudentNotes,
  enableAsyncPlan,
  promoteStudent,
} from "@/app/app/students/actions";
import { LevelBadge } from "@/components/level-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { nextCefrLevel, type LevelCode } from "@/lib/levels";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStaff();
  const supabase = await createClient();
  const t = await getTranslations("students");

  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_active, notes, role")
    .eq("id", id)
    .eq("role", "student")
    .maybeSingle();

  if (!student) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("level:levels(id, code, subtitle), status, plan")
    .eq("student_id", id)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .maybeSingle();

  const level = enrollment?.level as
    | { id: string; code: LevelCode; subtitle: string }
    | null;
  const plan = enrollment?.plan ?? "guided";
  const nextCode = level ? nextCefrLevel(level.code) : null;

  // Completion in the current level (for promotion readiness).
  let pct = 0;
  if (level) {
    const [{ data: lessons }, { data: done }] = await Promise.all([
      supabase.from("lessons").select("id").eq("level_id", level.id),
      supabase
        .from("lesson_access")
        .select("lesson_id")
        .eq("student_id", id)
        .not("completed_at", "is", null),
    ]);
    const total = (lessons ?? []).length;
    const doneSet = new Set((done ?? []).map((d) => d.lesson_id));
    const completed = (lessons ?? []).filter((l) => doneSet.has(l.id)).length;
    pct = total ? Math.round((completed / total) * 100) : 0;
  }

  const initials = (student.full_name || student.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
        <Link href="/app/students">
          <ArrowLeft className="size-4" />
          {t("title")}
        </Link>
      </Button>

      <div className="flex flex-col gap-4 rounded-2xl glass-card p-6 sm:flex-row sm:items-center">
        <Avatar className="size-16 border">
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">
            {student.full_name || "—"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {student.email}
            </span>
            {student.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {student.phone}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {level ? (
            <LevelBadge code={level.code} size="lg" />
          ) : (
            <Badge variant="outline">{t("noLevel")}</Badge>
          )}
          <Badge variant={student.is_active ? "secondary" : "outline"}>
            {student.is_active ? t("active") : t("inactive")}
          </Badge>
        </div>
      </div>

      <section className="mt-6 glass-card rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              {t("planTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {plan === "async" ? t("planAsyncDesc") : t("planGuidedDesc")}
            </p>
          </div>
          <Badge variant={plan === "async" ? "default" : "secondary"}>
            {plan === "async" ? t("planAsync") : t("planGuided")}
          </Badge>
        </div>
        {plan !== "async" && level && (
          <form action={enableAsyncPlan} className="mt-4">
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="levelId" value={level.id} />
            <Button type="submit" size="sm" variant="outline">
              {t("enableAsync")}
            </Button>
          </form>
        )}
      </section>

      {level && (
        <section className="mt-6 glass-card rounded-2xl p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">
              {t("levelTitle")}
            </h2>
            <LevelBadge code={level.code} size="sm" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("completionLabel")}</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <Progress value={pct} className="mt-2" />
          <div className="mt-4">
            {nextCode ? (
              <form action={promoteStudent}>
                <input type="hidden" name="studentId" value={student.id} />
                <Button type="submit" size="sm" className="gap-1.5">
                  🎉 {t("promoteTo")} {nextCode}
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                {(["FCE", "PHONETICS"] as LevelCode[]).includes(level.code)
                  ? t("isTrack")
                  : t("atTop")}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="mt-6 glass-card rounded-2xl p-6">
        <h2 className="mb-3 font-heading text-lg font-semibold">Notas</h2>
        <form action={updateStudentNotes} className="space-y-3">
          <input type="hidden" name="studentId" value={student.id} />
          <Textarea
            name="notes"
            defaultValue={student.notes ?? ""}
            rows={5}
            placeholder="Notas privadas sobre el alumno (objetivos, observaciones, etc.)"
          />
          <Button type="submit" size="sm">
            Guardar
          </Button>
        </form>
      </section>
    </div>
  );
}
