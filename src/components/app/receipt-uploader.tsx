"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Upload, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitReceipt, type SubmitResult } from "@/app/app/payments/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReceiptUploader({
  userId,
  amount,
  kind,
  defaultPeriod,
}: {
  userId: string;
  amount: number;
  kind: "individual" | "group" | "async";
  defaultPeriod: string;
}) {
  const t = useTranslations("payments");
  const [path, setPath] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [state, action, pending] = useActionState<SubmitResult | null, FormData>(
    submitReceipt,
    null,
  );

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const key = `${userId}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const { error } = await supabase.storage
      .from("receipts")
      .upload(key, file, { upsert: false });
    setUploading(false);
    if (!error) {
      setPath(key);
      setFileName(file.name);
    }
  }

  if (state?.ok) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-accent/50 px-4 py-3 text-sm text-accent-foreground">
        <Check className="size-4" />
        {t("submitted")}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="receiptPath" value={path} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="period">{t("period")}</Label>
          <Input id="period" name="period" type="month" defaultValue={defaultPeriod} required />
        </div>
        <div className="space-y-1.5">
          <Label>{t("receipt")}</Label>
          <label className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm text-muted-foreground hover:bg-muted">
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : path ? (
              <Check className="size-4 text-brand-leaf" />
            ) : (
              <Upload className="size-4" />
            )}
            <span className="truncate">{fileName || t("chooseFile")}</span>
            <input type="file" accept="image/*,application/pdf" onChange={onFile} className="hidden" />
          </label>
        </div>
      </div>
      {state && !state.ok && (
        <p className="text-sm text-destructive">{t("uploadError")}</p>
      )}
      <Button type="submit" disabled={!path || pending} className="gap-2">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {t("submitReceipt")}
      </Button>
    </form>
  );
}
