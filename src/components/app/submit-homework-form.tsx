"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Upload, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitHomework } from "@/app/app/homework/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SubmitHomeworkForm({
  submissionId,
  userId,
  defaultText,
}: {
  submissionId: string;
  userId: string;
  defaultText: string;
}) {
  const t = useTranslations("homework");
  const [path, setPath] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [uploading, setUploading] = React.useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const key = `${userId}/${submissionId}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const { error } = await supabase.storage
      .from("submissions")
      .upload(key, file, { upsert: true });
    setUploading(false);
    if (!error) {
      setPath(key);
      setFileName(file.name);
    }
  }

  return (
    <form action={submitHomework} className="space-y-4">
      <input type="hidden" name="submissionId" value={submissionId} />
      <input type="hidden" name="filePath" value={path} />
      <div className="space-y-1.5">
        <Label htmlFor="hw-text">{t("yourAnswer")}</Label>
        <Textarea id="hw-text" name="text" rows={6} defaultValue={defaultText} />
      </div>
      <div className="space-y-1.5">
        <Label>{t("attachFile")}</Label>
        <label className="flex h-9 w-fit cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm text-muted-foreground hover:bg-muted">
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : path ? (
            <Check className="size-4 text-brand-leaf" />
          ) : (
            <Upload className="size-4" />
          )}
          <span className="truncate">{fileName || t("chooseFile")}</span>
          <input type="file" accept="image/*,application/pdf,audio/*" onChange={onFile} className="hidden" />
        </label>
      </div>
      <Button type="submit" disabled={uploading}>
        {t("submit")}
      </Button>
    </form>
  );
}
