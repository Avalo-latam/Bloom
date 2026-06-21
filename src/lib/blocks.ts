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
  guide?: string;
  html?: string;
  videoUrl?: string;
  kahootUrl?: string;
  quizId?: string;
  phonetics?: { word: string; ipa?: string; audioUrl?: string }[];
};
