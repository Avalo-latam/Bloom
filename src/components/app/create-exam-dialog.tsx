"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { createExam, type CreateExamResult } from "@/app/app/exams/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { id: string; label: string };

export function CreateExamDialog({
  quizzes,
  levels,
}: {
  quizzes: Option[];
  levels: Option[];
}) {
  const t = useTranslations("exams");
  const [open, setOpen] = React.useState(false);
  const [quizId, setQuizId] = React.useState("");
  const [levelId, setLevelId] = React.useState("");
  const [state, action, pending] = useActionState<CreateExamResult | null, FormData>(
    createExam,
    null,
  );

  React.useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          {t("newExam")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action}>
          <DialogHeader>
            <DialogTitle>{t("newExam")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="e-title">{t("examTitle")}</Label>
              <Input id="e-title" name="title" required minLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("pickQuiz")}</Label>
              <input type="hidden" name="quizId" value={quizId} />
              <Select value={quizId} onValueChange={setQuizId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("pickQuiz")} />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((qz) => (
                    <SelectItem key={qz.id} value={qz.id}>
                      {qz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("pickLevel")}</Label>
              <input type="hidden" name="levelId" value={levelId} />
              <Select value={levelId} onValueChange={setLevelId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("anyLevel")} />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending || !quizId} className="gap-2">
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? t("creating") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
