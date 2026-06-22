import {
  Flame,
  RefreshCw,
  Presentation,
  Dumbbell,
  MessagesSquare,
  Headphones,
  Gamepad2,
  FlagTriangleRight,
  type LucideIcon,
} from "lucide-react";

export type BlockKind =
  | "warmup"
  | "review"
  | "presentation"
  | "practice"
  | "speaking"
  | "listening"
  | "game"
  | "wrapup";

export const BLOCK_META: Record<
  BlockKind,
  { icon: LucideIcon; color: string }
> = {
  warmup: { icon: Flame, color: "brand-peach" },
  review: { icon: RefreshCw, color: "brand-sky" },
  presentation: { icon: Presentation, color: "brand-lila" },
  practice: { icon: Dumbbell, color: "brand-mint" },
  speaking: { icon: MessagesSquare, color: "brand-rose" },
  listening: { icon: Headphones, color: "brand-sky" },
  game: { icon: Gamepad2, color: "brand-lemon" },
  wrapup: { icon: FlagTriangleRight, color: "brand-leaf" },
};

export type BlockContent = {
  type?: string;
  /** Teacher-facing note (shown to staff only — the choreography guide). */
  guide?: string;
  /** Rich student-facing explanation (trusted HTML authored by us). */
  html?: string;
  /** Example sentences. */
  examples?: string[];
  /** Vocabulary list. */
  vocab?: { term: string; es: string }[];
  /** A short reading passage. */
  reading?: { title?: string; text: string };
  /** Speaking prompt / questions for production. */
  speaking?: string[];
  /** A highlighted tip. */
  tip?: string;
  videoUrl?: string;
  /** A themed YouTube search ("watch a video about X") — robust, never broken. */
  videoSearch?: string;
  kahootUrl?: string;
  quizId?: string;
  phonetics?: { word: string; ipa?: string; audioUrl?: string }[];
};
