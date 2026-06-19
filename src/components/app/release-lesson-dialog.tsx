"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Share2, Check } from "lucide-react";
import { releaseLesson } from "@/app/app/curriculum/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Student = { id: string; name: string; released: boolean };

export function ReleaseLessonDialog({
  lessonId,
  lessonTitle,
  students,
  releasedCount,
}: {
  lessonId: string;
  lessonTitle: string;
  students: Student[];
  releasedCount: number;
}) {
  const t = useTranslations("curriculum");
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Share2 className="size-3.5" />
          {t("release")}
          {releasedCount > 0 && (
            <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 text-xs text-primary">
              {releasedCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          action={async (fd) => {
            await releaseLesson(fd);
            setOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("releaseToStudent")}</DialogTitle>
            <DialogDescription>{lessonTitle}</DialogDescription>
          </DialogHeader>
          <input type="hidden" name="lessonId" value={lessonId} />
          <div className="my-4 max-h-72 space-y-1 overflow-y-auto">
            {students.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("noStudentsToRelease")}
              </p>
            )}
            {students.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
              >
                <span className="text-sm font-medium">{s.name}</span>
                {s.released ? (
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    <Check className="size-3.5" />
                    {t("released_")}
                  </span>
                ) : (
                  <input
                    type="checkbox"
                    name="studentIds"
                    value={s.id}
                    defaultChecked
                    className="size-4 accent-[var(--primary)]"
                  />
                )}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={students.every((s) => s.released)}>
              {t("release")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
