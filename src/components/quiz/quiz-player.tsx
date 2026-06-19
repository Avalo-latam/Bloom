"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Check, X, RotateCcw, ArrowUp, ArrowDown } from "lucide-react";
import {
  type Quiz,
  type QuizQuestion,
  type QuizResponse,
  type MultipleChoiceData,
  type FillBlankData,
  type MatchingData,
  type OrderingData,
  scoreQuestion,
} from "@/lib/quiz";
import { YouTubeEmbed } from "@/components/embeds/youtube";
import { Celebrate } from "@/components/celebrate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const t = useTranslations("quiz");
  const [index, setIndex] = React.useState(0);
  const [responses, setResponses] = React.useState<Record<string, QuizResponse>>({});
  const [checked, setChecked] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [fire, setFire] = React.useState(0);

  const q = quiz.questions[index];
  const total = quiz.questions.length;
  const response = responses[q?.id] ?? null;

  function setResponse(r: QuizResponse) {
    setResponses((p) => ({ ...p, [q.id]: r }));
  }

  function finish() {
    const pts = quiz.questions.reduce((s, qq) => s + qq.points, 0) || 1;
    const got = quiz.questions.reduce(
      (s, qq) => s + scoreQuestion(qq, responses[qq.id] ?? null) * qq.points,
      0,
    );
    const pct = Math.round((got / pts) * 100);
    setFinished(true);
    if (pct >= 60) setFire((f) => f + 1);
  }

  function next() {
    if (!checked) {
      setChecked(true);
      return;
    }
    setChecked(false);
    if (index + 1 < total) setIndex(index + 1);
    else finish();
  }

  function retry() {
    setResponses({});
    setChecked(false);
    setIndex(0);
    setFinished(false);
  }

  if (finished) {
    const pts = quiz.questions.reduce((s, qq) => s + qq.points, 0) || 1;
    const got = quiz.questions.reduce(
      (s, qq) => s + scoreQuestion(qq, responses[qq.id] ?? null) * qq.points,
      0,
    );
    const pct = Math.round((got / pts) * 100);
    const tier = pct >= 80 ? "great" : pct >= 60 ? "good" : "keepPracticing";
    return (
      <>
        <Celebrate fire={fire} />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 text-center"
        >
          <div className="mx-auto mb-3 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <svg viewBox="0 0 24 24" className="size-8" aria-hidden>
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <ellipse key={a} cx="12" cy="7.5" rx="2.4" ry="4.2" fill="var(--brand-rose)" transform={`rotate(${a} 12 12)`} />
              ))}
              <circle cx="12" cy="12" r="3" fill="var(--brand-lemon)" />
            </svg>
          </div>
          <div className="font-heading text-5xl font-extrabold text-primary">
            {pct}%
          </div>
          <p className="mt-2 text-muted-foreground">{t(tier)}</p>
          <Button onClick={retry} className="mt-6 gap-2">
            <RotateCcw className="size-4" />
            {t("retry")}
          </Button>
        </motion.div>
      </>
    );
  }

  if (!q) return null;

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <Progress value={((index + (checked ? 1 : 0)) / total) * 100} className="h-2" />
        <span className="shrink-0 text-xs text-muted-foreground">
          {index + 1} {t("of")} {total}
        </span>
      </div>

      <motion.div
        key={q.id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="mb-4 font-heading text-lg font-bold">{q.prompt}</h3>
        <QuestionBody q={q} response={response} setResponse={setResponse} checked={checked} />

        {checked && q.explanation && (
          <p className="mt-4 rounded-xl bg-accent/50 px-4 py-2.5 text-sm text-accent-foreground">
            {q.explanation}
          </p>
        )}
      </motion.div>

      <div className="mt-6 flex justify-end">
        <Button onClick={next} disabled={!response && !checked} className="min-w-28">
          {!checked ? t("check") : index + 1 < total ? t("next") : t("finish")}
        </Button>
      </div>
    </div>
  );
}

function QuestionBody({
  q,
  response,
  setResponse,
  checked,
}: {
  q: QuizQuestion;
  response: QuizResponse | null;
  setResponse: (r: QuizResponse) => void;
  checked: boolean;
}) {
  switch (q.kind) {
    case "multiple_choice":
    case "listening":
      return <ChoiceBody q={q} response={response} setResponse={setResponse} checked={checked} />;
    case "fill_blank":
    case "lyrics_complete":
      return <FillBody q={q} response={response} setResponse={setResponse} checked={checked} />;
    case "matching":
      return <MatchBody q={q} response={response} setResponse={setResponse} checked={checked} />;
    case "ordering":
      return <OrderBody q={q} response={response} setResponse={setResponse} checked={checked} />;
    default:
      return null;
  }
}

function ChoiceBody({ q, response, setResponse, checked }: BodyProps) {
  const d = q.data as MultipleChoiceData;
  const correct = Array.isArray(d.answer) ? d.answer : [d.answer];
  const selected = (response as { selected: number[] } | null)?.selected ?? [];

  function toggle(i: number) {
    if (checked) return;
    if (d.multiple) {
      const set = new Set(selected);
      set.has(i) ? set.delete(i) : set.add(i);
      setResponse({ kind: q.kind as "multiple_choice", selected: [...set] });
    } else {
      setResponse({ kind: q.kind as "multiple_choice", selected: [i] });
    }
  }

  return (
    <div className="space-y-3">
      {d.videoUrl && <YouTubeEmbed url={d.videoUrl} className="mb-4" />}
      {d.audioUrl && <audio controls src={d.audioUrl} className="mb-2 w-full" />}
      <div className="grid gap-2">
        {d.options.map((opt, i) => {
          const isSel = selected.includes(i);
          const isRight = correct.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                !checked && isSel && "border-primary bg-primary/10",
                !checked && !isSel && "hover:bg-muted",
                checked && isRight && "border-brand-leaf bg-brand-mint/40",
                checked && isSel && !isRight && "border-destructive bg-destructive/10",
              )}
            >
              <span>{opt}</span>
              {checked && isRight && <Check className="size-4 text-brand-leaf" />}
              {checked && isSel && !isRight && <X className="size-4 text-destructive" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FillBody({ q, response, setResponse, checked }: BodyProps) {
  const d = q.data as FillBlankData;
  const parts = d.text.split("___");
  const values = (response as { values: string[] } | null)?.values ?? [];

  function setAt(i: number, v: string) {
    const next = [...values];
    next[i] = v;
    setResponse({ kind: q.kind as "fill_blank", values: next });
  }

  return (
    <div className="space-y-3">
      {d.videoUrl && <YouTubeEmbed url={d.videoUrl} className="mb-4" />}
      <p className="text-lg leading-loose">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <span className="whitespace-pre-line">{part}</span>
            {i < parts.length - 1 && (
              <Input
                value={values[i] ?? ""}
                onChange={(e) => setAt(i, e.target.value)}
                disabled={checked}
                className={cn(
                  "mx-1 inline-block h-9 w-32 align-middle",
                  checked &&
                    (blankOk(d, i, values[i] ?? "")
                      ? "border-brand-leaf bg-brand-mint/30"
                      : "border-destructive bg-destructive/10"),
                )}
              />
            )}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
}

function blankOk(d: FillBlankData, i: number, v: string) {
  const a = d.answers[i];
  const accepts = Array.isArray(a) ? a : [a];
  const norm = (s: string) => s.trim().toLowerCase().replace(/[.,!?;:]/g, "");
  return accepts.some((x) => norm(x) === norm(v));
}

function MatchBody({ q, response, setResponse, checked }: BodyProps) {
  const d = q.data as MatchingData;
  // deterministic scramble of the right options
  const rights = React.useMemo(
    () =>
      d.pairs
        .map((p, i) => ({ label: p.right, i }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [d.pairs],
  );
  const map = (response as { map: Record<number, number> } | null)?.map ?? {};

  function setPair(left: number, right: number) {
    setResponse({ kind: "matching", map: { ...map, [left]: right } });
  }

  return (
    <div className="space-y-2">
      {d.pairs.map((p, li) => (
        <div key={li} className="flex items-center gap-3">
          <span className="flex-1 rounded-xl border bg-muted/40 px-3 py-2 text-sm font-medium">
            {p.left}
          </span>
          <span className="text-muted-foreground">→</span>
          <select
            value={map[li] ?? ""}
            disabled={checked}
            onChange={(e) => setPair(li, Number(e.target.value))}
            className={cn(
              "h-10 flex-1 rounded-xl border bg-card px-3 text-sm",
              checked &&
                (map[li] === li
                  ? "border-brand-leaf bg-brand-mint/30"
                  : "border-destructive bg-destructive/10"),
            )}
          >
            <option value="" disabled>
              —
            </option>
            {rights.map((r) => (
              <option key={r.i} value={r.i}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function OrderBody({ q, response, setResponse, checked }: BodyProps) {
  const d = q.data as OrderingData;
  // initial scramble: alphabetical (stable, deterministic)
  const initial = React.useMemo(
    () => d.items.map((_, i) => i).sort((a, b) => d.items[a].localeCompare(d.items[b])),
    [d.items],
  );
  const order = (response as { order: number[] } | null)?.order ?? initial;

  function move(pos: number, dir: -1 | 1) {
    const ni = pos + dir;
    if (ni < 0 || ni >= order.length) return;
    const next = [...order];
    [next[pos], next[ni]] = [next[ni], next[pos]];
    setResponse({ kind: "ordering", order: next });
  }

  return (
    <div className="space-y-2">
      {order.map((origIdx, pos) => (
        <div
          key={origIdx}
          className={cn(
            "flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-sm",
            checked &&
              (order[pos] === pos
                ? "border-brand-leaf bg-brand-mint/30"
                : "border-destructive bg-destructive/10"),
          )}
        >
          <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-xs font-semibold">
            {pos + 1}
          </span>
          <span className="flex-1">{d.items[origIdx]}</span>
          {!checked && (
            <span className="flex gap-1">
              <button type="button" onClick={() => move(pos, -1)} className="rounded p-1 hover:bg-muted">
                <ArrowUp className="size-4" />
              </button>
              <button type="button" onClick={() => move(pos, 1)} className="rounded p-1 hover:bg-muted">
                <ArrowDown className="size-4" />
              </button>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

type BodyProps = {
  q: QuizQuestion;
  response: QuizResponse | null;
  setResponse: (r: QuizResponse) => void;
  checked: boolean;
};
