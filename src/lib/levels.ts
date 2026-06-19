export const LEVEL_CODES = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "FCE",
  "PHONETICS",
] as const;

export type LevelCode = (typeof LEVEL_CODES)[number];

/** CEFR ladder used for level-up logic (tracks FCE/PHONETICS sit outside it). */
export const CEFR_LADDER: LevelCode[] = ["A1", "A2", "B1", "B2", "C1"];

type LevelMeta = {
  /** Tailwind brand color token suffix (see globals.css). */
  color: string;
  short: string;
};

export const LEVEL_META: Record<LevelCode, LevelMeta> = {
  A1: { color: "brand-mint", short: "A1" },
  A2: { color: "brand-sky", short: "A2" },
  B1: { color: "brand-lila", short: "B1" },
  B2: { color: "brand-peach", short: "B2" },
  C1: { color: "brand-rose", short: "C1" },
  FCE: { color: "brand-lemon", short: "FCE" },
  PHONETICS: { color: "brand-leaf", short: "IPA" },
};

export function nextCefrLevel(code: LevelCode): LevelCode | null {
  const i = CEFR_LADDER.indexOf(code);
  if (i === -1 || i === CEFR_LADDER.length - 1) return null;
  return CEFR_LADDER[i + 1];
}
