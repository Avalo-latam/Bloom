"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { updateUnit, updateLesson, updateBlock } from "@/app/app/curriculum/edit-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

function EditShell({
  title, children, action,
}: {
  title: string;
  children: React.ReactNode;
  action: (fd: FormData) => Promise<void>;
}) {
  const t = useTranslations("edit");
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="size-7 text-muted-foreground" aria-label={t("edit")}>
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={async (fd) => { await action(fd); setOpen(false); }}>
          <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">{children}</div>
          <DialogFooter><Button type="submit">{t("save")}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditUnitDialog({ id, title }: { id: string; title: string }) {
  const t = useTranslations("edit");
  return (
    <EditShell title={t("editUnit")} action={updateUnit}>
      <input type="hidden" name="id" value={id} />
      <div className="space-y-1.5">
        <Label htmlFor={`u-${id}`}>{t("unitTitle")}</Label>
        <Input id={`u-${id}`} name="title" defaultValue={title} required />
      </div>
    </EditShell>
  );
}

export function EditLessonDialog({
  id, title, objective,
}: { id: string; title: string; objective: string | null }) {
  const t = useTranslations("edit");
  return (
    <EditShell title={t("editLesson")} action={updateLesson}>
      <input type="hidden" name="id" value={id} />
      <div className="space-y-1.5">
        <Label>{t("lessonTitle")}</Label>
        <Input name="title" defaultValue={title} required />
      </div>
      <div className="space-y-1.5">
        <Label>{t("objective")}</Label>
        <Textarea name="objective" rows={2} defaultValue={objective ?? ""} />
      </div>
    </EditShell>
  );
}

export function EditBlockDialog({
  id, lessonId, title, html, examples, guide,
}: {
  id: string; lessonId: string; title: string;
  html?: string; examples?: string[]; guide?: string;
}) {
  const t = useTranslations("edit");
  return (
    <EditShell title={t("editLesson")} action={updateBlock}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <div className="space-y-1.5">
        <Label>{t("blockTitle")}</Label>
        <Input name="title" defaultValue={title} />
      </div>
      <div className="space-y-1.5">
        <Label>{t("content")}</Label>
        <Textarea name="html" rows={4} defaultValue={html ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label>{t("addExample")} (1 / línea)</Label>
        <Textarea name="examples" rows={3} defaultValue={(examples ?? []).join("\n")} />
      </div>
      <div className="space-y-1.5">
        <Label>{t("teacherNote")}</Label>
        <Textarea name="guide" rows={2} defaultValue={guide ?? ""} />
      </div>
    </EditShell>
  );
}
