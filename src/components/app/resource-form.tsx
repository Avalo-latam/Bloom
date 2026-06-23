"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Upload, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addResource, type AddResourceResult } from "@/app/app/resources/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function ResourceForm({
  userId,
  levels,
}: {
  userId: string;
  levels: { id: string; label: string }[];
}) {
  const t = useTranslations("resources");
  const [open, setOpen] = React.useState(false);
  const [path, setPath] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [levelId, setLevelId] = React.useState("");
  const [state, action, pending] = useActionState<AddResourceResult | null, FormData>(addResource, null);

  React.useEffect(() => { if (state?.ok) setOpen(false); }, [state]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const supabase = createClient();
    const key = `${userId}/${Date.now()}-${f.name.replace(/[^\w.\-]/g, "_")}`;
    const { error } = await supabase.storage.from("materials").upload(key, f);
    setUploading(false);
    if (!error) { setPath(key); setFileName(f.name); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="size-4" />{t("add")}</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action}>
          <DialogHeader><DialogTitle>{t("add")}</DialogTitle></DialogHeader>
          <input type="hidden" name="filePath" value={path} />
          <input type="hidden" name="levelId" value={levelId} />
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="r-title">{t("rtitle")}</Label>
              <Input id="r-title" name="title" required minLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-desc">{t("desc")}</Label>
              <Input id="r-desc" name="description" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("level")}</Label>
              <Select value={levelId} onValueChange={setLevelId}>
                <SelectTrigger><SelectValue placeholder={t("anyLevel")} /></SelectTrigger>
                <SelectContent>
                  {levels.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("uploadFile")}</Label>
              <label className="flex h-9 w-fit cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm text-muted-foreground hover:bg-muted">
                {uploading ? <Loader2 className="size-4 animate-spin" /> : path ? <Check className="size-4 text-brand-leaf" /> : <Upload className="size-4" />}
                <span className="truncate">{fileName || t("chooseFile")}</span>
                <input type="file" onChange={onFile} className="hidden" />
              </label>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-url">{t("or")} — {t("link")}</Label>
              <Input id="r-url" name="url" type="url" placeholder={t("linkUrl")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending || uploading} className="gap-2">
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
