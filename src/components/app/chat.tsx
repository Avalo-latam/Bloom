"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { sendMessage } from "@/app/app/messages/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
};

export function Chat({
  studentId,
  meId,
  messages,
  emptyText,
}: {
  studentId: string;
  meId: string;
  messages: ChatMessage[];
  emptyText: string;
}) {
  const t = useTranslations("messages");
  const formRef = React.useRef<HTMLFormElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-col gap-4">
      <div className="min-h-[40vh] space-y-2">
        {messages.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === meId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    mine ? "bg-primary text-primary-foreground" : "glass-card",
                  )}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        ref={formRef}
        action={async (fd) => {
          await sendMessage(fd);
          formRef.current?.reset();
        }}
        className="sticky bottom-20 flex items-end gap-2 lg:bottom-2"
      >
        <input type="hidden" name="studentId" value={studentId} />
        <textarea
          name="body"
          rows={1}
          required
          placeholder={t("placeholder")}
          className="max-h-32 flex-1 resize-none rounded-2xl border bg-card px-4 py-2.5 text-sm outline-none ring-ring focus-visible:ring-2"
        />
        <Button type="submit" size="icon" className="shrink-0 rounded-2xl">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
