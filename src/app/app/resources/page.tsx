import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteResource } from "@/app/app/resources/actions";
import { PageHeader } from "@/components/app/page-header";
import { ResourceForm } from "@/components/app/resource-form";
import { Button } from "@/components/ui/button";
import { IcLibrary } from "@/components/brand/icons";

export default async function ResourcesPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("resources");
  const isStaff = profile.role !== "student";

  let levelId: string | null = null;
  if (profile.role === "student") {
    const { data: enr } = await supabase
      .from("enrollments").select("level_id").eq("student_id", profile.id)
      .eq("status", "active").maybeSingle();
    levelId = enr?.level_id ?? null;
  }

  let query = supabase
    .from("resources")
    .select("id, title, description, kind, file_url, url, level:levels(code)")
    .order("created_at", { ascending: false });
  if (profile.role === "student" && levelId)
    query = query.or(`level_id.is.null,level_id.eq.${levelId}`);
  else if (profile.role === "student") query = query.is("level_id", null);

  const { data: resources } = await query;
  const { data: levels } = await supabase.from("levels").select("id, code").order("sort_order");

  // signed urls for files
  const withUrls = await Promise.all(
    (resources ?? []).map(async (r) => {
      let href = r.url;
      if (r.kind === "file" && r.file_url) {
        const { data } = await supabase.storage.from("materials").createSignedUrl(r.file_url, 3600);
        href = data?.signedUrl ?? null;
      }
      return { ...r, href };
    }),
  );

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("title")} description={isStaff ? t("subtitleStaff") : t("subtitleStudent")}>
        {isStaff && (
          <ResourceForm
            userId={profile.id}
            levels={(levels ?? []).map((l) => ({ id: l.id, label: l.code }))}
          />
        )}
      </PageHeader>

      {withUrls.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {t("none")}
        </p>
      ) : (
        <div className="space-y-2">
          {withUrls.map((r) => {
            const lvl = (r.level as { code: string } | null)?.code;
            return (
              <div key={r.id} className="glass-card flex items-center gap-3 rounded-2xl p-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-lila/40 text-primary">
                  <IcLibrary className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {r.description}{lvl ? ` · ${lvl}` : ""}
                  </div>
                </div>
                {r.href && (
                  <Button asChild size="sm" variant="outline">
                    <a href={r.href} target="_blank" rel="noopener noreferrer">
                      {r.kind === "file" ? t("download") : t("open")}
                    </a>
                  </Button>
                )}
                {isStaff && (
                  <form action={deleteResource}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" size="sm" variant="ghost" className="text-destructive">
                      ✕
                    </Button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
