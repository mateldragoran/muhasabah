import { MuhasabaRecord } from '../types/muhasabah';
import { StreakStats, NUMERICAL_MILESTONES } from '../types/streak';
import { formatSimpleDate } from '../data/defaultData';

/**
 * Validates if a record represents an actively completed Muhasabah session
 */
export function isRecordCompleted(record: MuhasabaRecord | undefined | null): boolean {
  if (!record) return false;
  if (record.isCompleted) return true;

  // Has engaged with istighfar or recorded transactions or customized gateways
  if (record.istighfarCount > 0) return true;
  if (record.transactions && record.transactions.length > 0) return true;
  if (record.reflectionNote && record.reflectionNote.trim().length > 0) return true;

  if (record.gateways) {
    const hasAuditChanges = Object.values(record.gateways).some(
      (g) => g.state !== 'vigilant' || g.enemy !== 'none' || (g.note && g.note.trim().length > 0)
    );
    if (hasAuditChanges) return true;
  }

  return false;
}

/**
 * Returns date string shifted by delta days from a base date string YYYY-MM-DD
 */
function shiftDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatSimpleDate(date);
}

/**
 * Calculates strict consecutive practice consistency and numerical milestones
 */
export function calculateStreakStats(allRecords: Record<string, MuhasabaRecord>): StreakStats {
  const completedDateSet = new Set<string>();

  for (const [dateStr, record] of Object.entries(allRecords)) {
    if (isRecordCompleted(record)) {
      completedDateSet.add(dateStr);
    }
  }

  const completedDates = Array.from(completedDateSet).sort();
  const totalCompletedDays = completedDates.length;

  const todayStr = formatSimpleDate(new Date());
  const yesterdayStr = shiftDateStr(todayStr, -1);

  const isCompletedToday = completedDateSet.has(todayStr);
  const isCompletedYesterday = completedDateSet.has(yesterdayStr);

  // Determine current unbroken streak
  let currentStreak = 0;

  if (isCompletedToday || isCompletedYesterday) {
    let checkCursor = isCompletedToday ? todayStr : yesterdayStr;
    while (completedDateSet.has(checkCursor)) {
      currentStreak++;
      checkCursor = shiftDateStr(checkCursor, -1);
    }
  } else {
    currentStreak = 0;
  }

  // Calculate longest streak in history
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: string | null = null;

  for (const d of completedDates) {
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const expectedNext = shiftDateStr(prevDate, 1);
      if (d === expectedNext) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    prevDate = d;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Purely numerical milestone thresholds
  const completedMilestones = NUMERICAL_MILESTONES.filter((m) => currentStreak >= m);
  const nextMilestone = NUMERICAL_MILESTONES.find((m) => currentStreak < m) || null;
  const daysToNextMilestone = nextMilestone !== null ? Math.max(0, nextMilestone - currentStreak) : 0;

  return {
    currentStreak,
    longestStreak,
    totalCompletedDays,
    completedDates,
    completedMilestones: [...completedMilestones],
    nextMilestone,
    daysToNextMilestone,
    isCompletedToday,
    lastCompletedDate: completedDates.length > 0 ? completedDates[completedDates.length - 1] : null,
  };
}
