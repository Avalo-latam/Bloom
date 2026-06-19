import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Wallet,
  ClipboardList,
  CalendarDays,
  BookOpen,
  Plus,
} from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/level-badge";
import type { LevelCode } from "@/lib/levels";

export default async function DashboardPage() {
  const profile = await getProfile();
  const t = await getTranslations("dash");
  const firstName =
    (profile.full_name || "").split(" ")[0] || profile.email || "";

  return (
    <div>
      <PageHeader
        title={t("greeting", { name: firstName })}
        description={t(
          profile.role === "owner"
            ? "subtitleOwner"
            : profile.role === "teacher"
              ? "subtitleTeacher"
              : "subtitleStudent",
        )}
      />
      {profile.role === "owner" && <OwnerDashboard />}
      {profile.role === "teacher" && <TeacherDashboard teacherId={profile.id} />}
      {profile.role === "student" && <StudentDashboard studentId={profile.id} />}
    </div>
  );
}

async function OwnerDashboard() {
  const supabase = await createClient();
  const t = await getTranslations("dash");

  const [students, teachers, enrollments, payments] = await Promise.all([
    countRole(supabase, "student"),
    countRole(supabase, "teacher"),
    supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .then((r) => r.count ?? 0),
    supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pendiente")
      .then((r) => r.count ?? 0),
  ]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("students")} value={students} icon={Users} href="/app/students" tone="primary" />
        <StatCard label={t("teachers")} value={teachers} icon={GraduationCap} href="/app/students" tone="lila" />
        <StatCard label={t("activeEnrollments")} value={enrollments} icon={BookOpen} href="/app/curriculum" tone="mint" />
        <StatCard label={t("pendingPayments")} value={payments} icon={Wallet} href="/app/payments" tone="peach" />
      </div>
      <QuickActions
        actions={[
          { href: "/app/students", label: t("addStudent"), icon: Plus },
          { href: "/app/curriculum", label: t("openCurriculum"), icon: BookOpen },
          { href: "/app/payments", label: t("reviewPayments"), icon: Wallet },
        ]}
        title={t("quickActions")}
      />
    </>
  );
}

async function TeacherDashboard({ teacherId }: { teacherId: string }) {
  const supabase = await createClient();
  const t = await getTranslations("dash");

  const [myStudents, toGrade, payments, classes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", teacherId)
      .then((r) => r.count ?? 0),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted")
      .then((r) => r.count ?? 0),
    supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pendiente")
      .then((r) => r.count ?? 0),
    supabase.from("classes").select("starts_at, recurrence").eq("teacher_id", teacherId),
  ]);

  const today = new Date();
  const todayCount = (classes.data ?? []).filter((c) => {
    const d = new Date(c.starts_at);
    return c.recurrence === "weekly"
      ? d.getDay() === today.getDay()
      : d.toDateString() === today.toDateString();
  }).length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("myStudents")} value={myStudents} icon={Users} href="/app/students" tone="primary" />
        <StatCard label={t("todayClasses")} value={todayCount} icon={CalendarDays} href="/app/schedule" tone="sky" />
        <StatCard label={t("toGrade")} value={toGrade} icon={ClipboardList} href="/app/homework" tone="lila" />
        <StatCard label={t("pendingPayments")} value={payments} icon={Wallet} href="/app/payments" tone="peach" />
      </div>
      <QuickActions
        actions={[
          { href: "/app/students", label: t("addStudent"), icon: Plus },
          { href: "/app/schedule", label: t("scheduleClass"), icon: CalendarDays },
          { href: "/app/curriculum", label: t("openCurriculum"), icon: BookOpen },
        ]}
        title={t("quickActions")}
      />
    </>
  );
}

async function StudentDashboard({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const t = await getTranslations("dash");

  const [pendingHomework, enrollment, lastPayment] = await Promise.all([
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("status", "assigned")
      .then((r) => r.count ?? 0),
    supabase
      .from("enrollments")
      .select("level:levels(code, subtitle)")
      .eq("student_id", studentId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("status")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const level = (enrollment.data?.level as { code: LevelCode; subtitle: string } | null) ?? null;
  const paid = lastPayment.data?.status ?? "verificado";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
        <span className="text-sm font-medium text-muted-foreground">
          {t("currentLevel")}
        </span>
        {level ? (
          <div className="flex items-center gap-3">
            <LevelBadge code={level.code} size="lg" />
            <span className="text-sm text-muted-foreground">{level.subtitle}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{t("noLevel")}</span>
        )}
        <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
          <Link href="/app/curriculum">{t("openCurriculum")}</Link>
        </Button>
      </div>
      <StatCard
        label={t("pendingHomework")}
        value={pendingHomework}
        icon={ClipboardList}
        href="/app/homework"
        tone="lila"
      />
      <StatCard
        label={t("paymentStatus")}
        value={
          paid === "pendiente" ? "⏳" : paid === "rechazado" ? "⚠️" : "✓"
        }
        icon={Wallet}
        hint={paid === "verificado" ? t("upToDate") : undefined}
        href="/app/payments"
        tone="peach"
      />
    </div>
  );
}

function QuickActions({
  actions,
  title,
}: {
  actions: { href: string; label: string; icon: typeof Plus }[];
  title: string;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-heading text-lg font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {actions.map(({ href, label, icon: Icon }) => (
          <Button key={href} asChild variant="outline" className="gap-2">
            <Link href={href}>
              <Icon className="size-4" />
              {label}
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}

function countRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  role: "student" | "teacher",
) {
  return supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", role)
    .then((r) => r.count ?? 0);
}
