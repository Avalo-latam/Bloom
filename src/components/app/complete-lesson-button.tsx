"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import { toggleLessonComplete } from "@/app/app/curriculum/actions";
import { Button } from "@/components/ui/button";
import { Celebrate } from "@/components/celebrate";

export function CompleteLessonButton({
  lessonId,
  completed,
}: {
  lessonId: string;
  completed: boolean;
}) {
  const t = useTranslations("curriculum");
  const [pending, start] = React.useTransition();
  const [fire, setFire] = React.useState(0);
  const [done, setDone] = React.useState(completed);

  function onClick() {
    const next = !done;
    start(async () => {
      const fd = new FormData();
      fd.set("lessonId", lessonId);
      fd.set("done", String(next));
      await toggleLessonComplete(fd);
      setDone(next);
      if (next) setFire((f) => f + 1);
    });
  }

  return (
    <>
      <Celebrate fire={fire} />
      <Button
        onClick={onClick}
        disabled={pending}
        size="lg"
        variant={done ? "outline" : "default"}
        className="gap-2"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
        {done ? t("completed") : t("markComplete")}
      </Button>
    </>
  );
}
