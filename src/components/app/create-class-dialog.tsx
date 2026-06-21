"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { createClass, type CreateClassResult } from "@/app/app/schedule/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateClassDialog({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const t = useTranslations("schedule");
  const [open, setOpen] = React.useState(false);
  const [kind, setKind] = React.useState("individual");
  const [recurrence, setRecurrence] = React.useState("weekly");
  const [state, action, pending] = useActionState<
    CreateClassResult | null,
    FormData
  >(createClass, null);

  React.useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          {t("newClass")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action}>
          <DialogHeader>
            <DialogTitle>{t("newClass")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-title">{t("classTitle")}</Label>
              <Input id="c-title" name="title" required minLength={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("kind")}</Label>
                <input type="hidden" name="kind" value={kind} />
                <div className="flex gap-1.5">
                  {(["individual", "group"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKind(k)}
                      className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium ${kind === k ? "border-primary bg-primary/10 text-primary" : ""}`}
                    >
                      {t(k)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-dur">{t("duration")}</Label>
                <Input id="c-dur" name="durationMin" type="number" defaultValue={60} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-dt">{t("datetime")}</Label>
              <Input id="c-dt" name="startsAt" type="datetime-local" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-url">{t("meetingUrl")}</Label>
              <Input id="c-url" name="meetingUrl" type="url" placeholder="https://meet.google.com/…" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("recurrence")}</Label>
              <input type="hidden" name="recurrence" value={recurrence} />
              <div className="flex gap-1.5">
                {(["weekly", "none"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRecurrence(r)}
                    className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium ${recurrence === r ? "border-primary bg-primary/10 text-primary" : ""}`}
                  >
                    {t(r)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("selectStudents")}</Label>
              <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border p-2">
                {students.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      name="studentIds"
                      value={s.id}
                      className="size-4 accent-[var(--primary)]"
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="gap-2">
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? t("creating") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
