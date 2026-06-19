import type { BadgeVariant } from "@/components/brand/badges";

export type AchievementInput = {
  completedLessons: number;
  completedUnits: number;
  totalLessons: number;
};

export type Achievement = {
  id: BadgeVariant;
  /** keys under the "ach" messages namespace */
  labelKey: string;
  descKey: string;
  earned: boolean;
};

export function computeAchievements(i: AchievementInput): Achievement[] {
  return [
    { id: "first", labelKey: "firstT", descKey: "firstD", earned: i.completedLessons >= 1 },
    { id: "garden", labelKey: "gardenT", descKey: "gardenD", earned: i.completedLessons >= 5 },
    { id: "unit", labelKey: "unitT", descKey: "unitD", earned: i.completedUnits >= 1 },
    { id: "scholar", labelKey: "scholarT", descKey: "scholarD", earned: i.completedLessons >= 10 },
    {
      id: "level",
      labelKey: "levelT",
      descKey: "levelD",
      earned: i.totalLessons > 0 && i.completedLessons >= i.totalLessons,
    },
  ];
}
