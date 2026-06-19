import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateStudentNotes } from "@/app/app/students/actions";
import { LevelBadge } from "@/components/level-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { LevelCode } from "@/lib/levels";

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
    .select("level:levels(code, subtitle), status")
    .eq("student_id", id)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .maybeSingle();

  const level = enrollment?.level as { code: LevelCode; subtitle: string } | null;
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

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center">
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

      <section className="mt-6 rounded-2xl border bg-card p-6">
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
