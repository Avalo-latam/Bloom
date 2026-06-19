export type QuizKind =
  | "multiple_choice"
  | "fill_blank"
  | "lyrics_complete"
  | "matching"
  | "ordering"
  | "listening";

/** Per-kind `data` payload shapes stored in quiz_questions.data (jsonb). */
export type MultipleChoiceData = {
  options: string[];
  answer: number | number[];
  multiple?: boolean;
  videoUrl?: string;
  audioUrl?: string;
};
export type FillBlankData = {
  /** Text with `___` marking each blank. */
  text: string;
  /** Accepted answer(s) per blank, in order. A string or array of synonyms. */
  answers: (string | string[])[];
  videoUrl?: string;
};
export type MatchingData = { pairs: { left: string; right: string }[] };
export type OrderingData = { items: string[] };

export type QuizQuestion = {
  id: string;
  kind: QuizKind;
  prompt: string;
  media_url: string | null;
  data: unknown;
  explanation: string | null;
  points: number;
  sort_order: number;
};

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  questions: QuizQuestion[];
};

const norm = (s: string) =>
  s.trim().toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");

/** True when a single blank response matches any accepted answer. */
export function blankMatches(response: string, accepted: string | string[]) {
  const accepts = Array.isArray(accepted) ? accepted : [accepted];
  return accepts.some((a) => norm(a) === norm(response));
}

/** Number of blanks in a fill/lyrics text. */
export function countBlanks(text: string) {
  return (text.match(/___/g) ?? []).length;
}

export type QuizResponse =
  | { kind: "multiple_choice" | "listening"; selected: number[] }
  | { kind: "fill_blank" | "lyrics_complete"; values: string[] }
  | { kind: "matching"; map: Record<number, number> } // leftIndex -> rightIndex
  | { kind: "ordering"; order: number[] }; // current order of original indices

/** Returns 0..1 correctness for a question given the user's response. */
export function scoreQuestion(q: QuizQuestion, r: QuizResponse | null): number {
  if (!r) return 0;
  switch (q.kind) {
    case "multiple_choice":
    case "listening": {
      const d = q.data as MultipleChoiceData;
      const correct = Array.isArray(d.answer) ? d.answer : [d.answer];
      const sel = (r as { selected: number[] }).selected ?? [];
      const same =
        correct.length === sel.length &&
        correct.every((c) => sel.includes(c));
      return same ? 1 : 0;
    }
    case "fill_blank":
    case "lyrics_complete": {
      const d = q.data as FillBlankData;
      const vals = (r as { values: string[] }).values ?? [];
      if (!d.answers.length) return 0;
      const right = d.answers.filter((a, i) => blankMatches(vals[i] ?? "", a));
      return right.length / d.answers.length;
    }
    case "matching": {
      const d = q.data as MatchingData;
      const map = (r as { map: Record<number, number> }).map ?? {};
      const right = d.pairs.filter((_, i) => map[i] === i).length;
      return d.pairs.length ? right / d.pairs.length : 0;
    }
    case "ordering": {
      const d = q.data as OrderingData;
      const order = (r as { order: number[] }).order ?? [];
      const right = d.items.filter((_, i) => order[i] === i).length;
      return d.items.length ? right / d.items.length : 0;
    }
    default:
      return 0;
  }
}

export function isCorrect(q: QuizQuestion, r: QuizResponse | null) {
  return scoreQuestion(q, r) === 1;
}
