/**
 * Types for strict practice consistency and numerical milestones
 * Strictly numerical markers (no honorary titles or flattering labels)
 */

export const NUMERICAL_MILESTONES = [3, 7, 21, 40, 100] as const;
export type NumericalMilestone = (typeof NUMERICAL_MILESTONES)[number];

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletedDays: number;
  completedDates: string[]; // sorted YYYY-MM-DD
  completedMilestones: number[]; // e.g. [3, 7]
  nextMilestone: number | null; // e.g. 21
  daysToNextMilestone: number;
  isCompletedToday: boolean;
  lastCompletedDate: string | null;
}
