"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import {
  createAssignment,
  type CreateAssignmentResult,
} from "@/app/app/homework/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateAssignmentDialog({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const t = useTranslations("homework");
  const [open, setOpen] = React.useState(false);
  const [state, action, pending] = useActionState<
    CreateAssignmentResult | null,
    FormData
  >(createAssignment, null);

  React.useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          {t("newAssignment")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action}>
          <DialogHeader>
            <DialogTitle>{t("newAssignment")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="a-title">{t("titleLabel")}</Label>
              <Input id="a-title" name="title" required minLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-instr">{t("instructions")}</Label>
              <Textarea id="a-instr" name="instructions" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-due">{t("dueDate")}</Label>
              <Input id="a-due" name="dueAt" type="date" />
            </div>
            <div className="space-y-2">
              <Label>{t("selectStudents")}</Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border p-2">
                {students.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      name="studentIds"
                      value={s.id}
                      defaultChecked
                      className="size-4 accent-[var(--primary)]"
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
            {state && !state.ok && (
              <p className="text-sm text-destructive">{t("noStudents")}</p>
            )}
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
