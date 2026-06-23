import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { BloomScene } from "@/components/brand/illustrations";
import {
  IcCalendar, IcHomework, IcWallet, IcChat,
} from "@/components/brand/icons";

function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export async function StaffHome({
  teacherId,
  isOwner,
}: {
  teacherId: string;
  isOwner: boolean;
}) {
  const supabase = await createClient();
  const t = await getTranslations("dash");
  const ts = await getTranslations("schedule");

  let classesQ = supabase
    .from("classes")
    .select("id, title, starts_at, recurrence, meeting_url, teacher_id");
  if (!isOwner) classesQ = classesQ.eq("teacher_id", teacherId);

  const [{ data: classes }, { data: toGrade }, { data: pending }, { data: msgs }] =
    await Promise.all([
      classesQ,
      supabase.from("submissions").select("id").eq("status", "submitted"),
      supabase.from("payments").select("id").eq("status", "pendiente"),
      supabase.from("messages").select("id, sender_id, read_at"),
    ]);

  const today = new Date();
  const todays = (classes ?? [])
    .filter((c) => {
      const d = new Date(c.starts_at);
      return c.recurrence === "weekly"
        ? d.getDay() === today.getDay()
        : d.toDateString() === today.toDateString();
    })
    .sort((a, b) => fmtTime(a.starts_at).localeCompare(fmtTime(b.starts_at)));

  const unread = (msgs ?? []).filter((m) => m.sender_id !== teacherId && !m.read_at).length;

  const todos = [
    { n: (toGrade ?? []).length, label: t("toGrade"), href: "/app/homework", Icon: IcHomework, tone: "brand-lila" },
    { n: (pending ?? []).length, label: t("pendingPayments"), href: "/app/payments", Icon: IcWallet, tone: "brand-peach" },
    { n: unread, label: "Mensajes nuevos", href: "/app/messages", Icon: IcChat, tone: "brand-sky" },
  ].filter((x) => x.n > 0);

  const dateLabel = today.toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      {/* Today's classes */}
      <section className="glass-card rounded-3xl p-6">
        <h2 className="mb-1 font-heading text-lg font-semibold">{ts("upcoming")}</h2>
        <p className="mb-4 text-sm capitalize text-muted-foreground">{dateLabel}</p>
        {todays.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {ts("noClasses")}
          </p>
        ) : (
          <div className="space-y-2">
            {todays.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-mint/50">
                  <IcCalendar className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{fmtTime(c.starts_at)}</div>
                </div>
                {c.meeting_url && (
                  <Link href={c.meeting_url} target="_blank" className="text-xs font-medium text-primary">
                    {ts("join")}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* To-do + banner */}
      <section className="flex flex-col gap-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-lila/30 via-card to-brand-mint/25 p-6">
          <div className="max-w-[60%]">
            <h2 className="font-heading text-lg font-bold">¡A florecer hoy! 🌱</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tu campus al día. Revisá tus pendientes y dale para adelante.
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-4 w-40 opacity-90">
            <BloomScene />
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="mb-3 font-heading text-lg font-semibold">{t("todo")}</h2>
          {todos.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Todo al día ✅
            </p>
          ) : (
            <div className="space-y-2">
              {todos.map((x) => (
                <Link
                  key={x.href}
                  href={x.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted"
                >
                  <span
                    className="inline-flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `var(--${x.tone})` }}
                  >
                    <x.Icon className="size-4.5 text-foreground/70" />
                  </span>
                  <span className="flex-1 text-sm font-medium">{x.label}</span>
                  <span className="font-heading text-lg font-bold text-primary">{x.n}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
