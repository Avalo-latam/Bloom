"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Mic, Square, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Item = { word: string; ipa?: string; audioUrl?: string };

export function PhoneticsPractice({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <PhoneticsCard key={i} item={it} />
      ))}
    </div>
  );
}

function PhoneticsCard({ item }: { item: Item }) {
  const t = useTranslations("phonetics");
  const [recording, setRecording] = React.useState(false);
  const [url, setUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);
  const recRef = React.useRef<MediaRecorder | null>(null);
  const chunks = React.useRef<Blob[]>([]);

  async function start() {
    setError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => chunks.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((tr) => tr.stop());
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      setError(true);
    }
  }

  function stop() {
    recRef.current?.stop();
    setRecording(false);
  }

  function playYours() {
    if (url) new Audio(url).play();
  }
  function playRef() {
    if (item.audioUrl) new Audio(item.audioUrl).play();
  }

  return (
    <div className="glass-card flex flex-col items-center gap-2 rounded-2xl p-5 text-center">
      <div className="font-heading text-2xl font-bold">{item.word}</div>
      {item.ipa && (
        <div className="font-mono text-sm text-primary">{item.ipa}</div>
      )}
      <div className="mt-2 flex items-center gap-2">
        {item.audioUrl && (
          <Button type="button" size="icon" variant="outline" onClick={playRef} aria-label={t("playReference")}>
            <Play className="size-4" />
          </Button>
        )}
        <Button
          type="button"
          size="icon"
          onClick={recording ? stop : start}
          className={cn(recording && "animate-pulse bg-destructive hover:bg-destructive")}
          aria-label={recording ? t("stop") : t("record")}
        >
          {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
        </Button>
        {url && !recording && (
          <>
            <Button type="button" size="icon" variant="outline" onClick={playYours} aria-label={t("playYours")}>
              <Play className="size-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={start} aria-label={t("record")}>
              <RotateCcw className="size-4" />
            </Button>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {error ? t("micError") : recording ? t("recording") : t("tapToRecord")}
      </p>
    </div>
  );
}
