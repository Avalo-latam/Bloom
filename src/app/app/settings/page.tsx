import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updatePricing } from "@/app/app/settings/actions";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SettingsPage() {
  const me = await getProfile();
  if (me.role !== "owner") redirect("/app");
  const supabase = await createClient();
  const t = await getTranslations("settings");

  const { data: p } = await supabase
    .from("pricing")
    .select("alias, individual_price, group_price, async_price")
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <form action={updatePricing} className="glass-card space-y-5 rounded-3xl p-6">
        <h2 className="font-heading text-lg font-semibold">{t("pricing")}</h2>
        <div className="space-y-1.5">
          <Label htmlFor="alias">{t("alias")}</Label>
          <Input id="alias" name="alias" defaultValue={p?.alias ?? "bloom.mp"} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="ind">{t("individual")}</Label>
            <Input id="ind" name="individual_price" type="number" defaultValue={p?.individual_price ?? 20000} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grp">{t("group")}</Label>
            <Input id="grp" name="group_price" type="number" defaultValue={p?.group_price ?? 15000} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="asy">{t("asyncp")}</Label>
            <Input id="asy" name="async_price" type="number" defaultValue={p?.async_price ?? 20000} />
          </div>
        </div>
        <Button type="submit">{t("save")}</Button>
      </form>
    </div>
  );
}
