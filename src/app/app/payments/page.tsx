import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/page-header";
import { CopyAlias } from "@/components/app/copy-alias";
import { ReceiptUploader } from "@/components/app/receipt-uploader";
import { verifyPayment, rejectPayment } from "@/app/app/payments/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PayStatus = "pendiente" | "verificado" | "rechazado";

function StatusBadge({ status }: { status: PayStatus }) {
  const map = {
    pendiente: "bg-brand-lemon/50 text-foreground/70",
    verificado: "bg-brand-mint/60 text-foreground/70",
    rechazado: "bg-destructive/15 text-destructive",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>{status}</span>;
}

export default async function PaymentsPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("payments");

  const { data: pricing } = await supabase
    .from("pricing")
    .select("alias, individual_price, group_price, async_price")
    .limit(1)
    .maybeSingle();
  const alias = pricing?.alias ?? "bloom.mp";

  if (profile.role === "student") {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("plan")
      .eq("student_id", profile.id)
      .eq("status", "active")
      .maybeSingle();
    const plan = enrollment?.plan ?? "guided";
    const kind = plan === "async" ? "async" : "individual";
    const amount =
      plan === "async"
        ? (pricing?.async_price ?? 20000)
        : (pricing?.individual_price ?? 20000);

    const { data: payments } = await supabase
      .from("payments")
      .select("id, period, amount, status, kind, created_at")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false });

    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={t("title")} description={t("subtitleStudent")} />

        <div className="glass-card rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{t("payTo")}</p>
              <div className="mt-1">
                <CopyAlias alias={alias} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {t(plan === "async" ? "planAsync" : "planGuided")}
              </p>
              <p className="font-heading text-2xl font-extrabold text-primary">
                ${amount.toLocaleString("es-AR")}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  {t("perClass")}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-6 border-t pt-6">
            <ReceiptUploader
              userId={profile.id}
              amount={amount}
              kind={kind}
              defaultPeriod={new Date().toISOString().slice(0, 7)}
            />
          </div>
        </div>

        <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">
          {t("history")}
        </h2>
        <div className="space-y-2">
          {(payments ?? []).length === 0 && (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("noPayments")}
            </p>
          )}
          {(payments ?? []).map((p) => (
            <div
              key={p.id}
              className="glass-card flex items-center justify-between rounded-2xl px-4 py-3"
            >
              <div>
                <div className="font-medium">{p.period}</div>
                <div className="text-xs text-muted-foreground">
                  ${Number(p.amount).toLocaleString("es-AR")}
                </div>
              </div>
              <StatusBadge status={p.status as PayStatus} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Staff: receipts to verify.
  const { data: pending } = await supabase
    .from("payments")
    .select("id, period, amount, status, kind, receipt_url, student:profiles!payments_student_id_fkey(full_name, email)")
    .eq("status", "pendiente")
    .order("created_at", { ascending: false });

  const withUrls = await Promise.all(
    (pending ?? []).map(async (p) => {
      let url: string | null = null;
      if (p.receipt_url) {
        const { data } = await supabase.storage
          .from("receipts")
          .createSignedUrl(p.receipt_url, 3600);
        url = data?.signedUrl ?? null;
      }
      return { ...p, url };
    }),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("title")} description={t("subtitleStaff")} />
      <h2 className="mb-3 font-heading text-lg font-semibold">
        {t("pendingTitle")}
      </h2>
      {withUrls.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {t("noPending")}
        </p>
      ) : (
        <div className="space-y-3">
          {withUrls.map((p) => {
            const student = p.student as { full_name: string | null; email: string | null } | null;
            return (
              <div key={p.id} className="glass-card rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {student?.full_name || student?.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.period} · ${Number(p.amount).toLocaleString("es-AR")} ·{" "}
                      {t(p.kind === "async" ? "planAsync" : "planGuided")}
                    </div>
                  </div>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {t("viewReceipt")}
                    </a>
                  )}
                </div>
                {p.kind === "async" && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    🌱 {t("enablesAsync")}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <form action={verifyPayment}>
                    <input type="hidden" name="paymentId" value={p.id} />
                    <Button type="submit" size="sm">
                      {t("verify")}
                    </Button>
                  </form>
                  <form action={rejectPayment}>
                    <input type="hidden" name="paymentId" value={p.id} />
                    <Button type="submit" size="sm" variant="outline">
                      {t("reject")}
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
