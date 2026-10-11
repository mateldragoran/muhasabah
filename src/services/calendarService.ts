/**
 * Regional Solar & Lunar Hijri Calendar Engine
 * Handles automatic timezone detection, localized solar dates,
 * and regional Islamic lunar dates with customizable moon-sighting day adjustments.
 */

export interface RegionalDateInfo {
  solarFormatted: string; // e.g. "Wed, Oct 11, 2026"
  solarShort: string; // e.g. "11 Oct"
  solarDayOfWeek: string; // e.g. "Wednesday"
  hijriFormatted: string; // e.g. "28 Rabi' al-Awwal 1448 AH"
  hijriShort: string; // e.g. "28 Rabi' I"
  hijriDay: number;
  hijriMonth: string;
  hijriYear: string;
  timeZone: string; // e.g. "America/New_York"
  offsetDays: number; // e.g. -1, 0, +1
}

const STORAGE_KEY_HIJRI_OFFSET = 'muhasabah_hijri_day_offset';

/**
 * Gets the stored lunar day offset (-2 to +2 days)
 */
export function getStoredHijriOffset(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_HIJRI_OFFSET);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= -2 && parsed <= 2) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return 0;
}

/**
 * Saves the regional lunar day offset
 */
export function setStoredHijriOffset(offset: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_HIJRI_OFFSET, offset.toString());
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Detects the user's regional timezone safely
 */
export function detectUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Computes dual regional dates for a given Date or ISO string
 */
export function getRegionalDateInfo(
  dateInput: Date | string = new Date(),
  customOffset?: number
): RegionalDateInfo {
  const dateObj = typeof dateInput === 'string' ? new Date(`${dateInput}T12:00:00`) : new Date(dateInput);
  const timeZone = detectUserTimeZone();
  const offset = customOffset !== undefined ? customOffset : getStoredHijriOffset();

  // 1. Solar Gregorian formatting
  const solarFullFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  });

  const solarShortFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone,
  });

  const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone,
  });

  const solarFormatted = solarFullFormatter.format(dateObj);
  const solarShort = solarShortFormatter.format(dateObj);
  const solarDayOfWeek = weekdayFormatter.format(dateObj);

  // 2. Hijri Lunar calculation with regional offset
  // Adjust the date for lunar moon-sighting offset
  const hijriCalcDate = new Date(dateObj);
  if (offset !== 0) {
    hijriCalcDate.setDate(hijriCalcDate.getDate() + offset);
  }

  let hijriFormatted = '1448 AH';
  let hijriShort = '';
  let hijriDay = 1;
  let hijriMonth = 'Hijri';
  let hijriYear = '1448 AH';

  try {
    // Use the Umm al-Qura standard Intl calendar
    const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone,
    });

    const parts = hijriFormatter.formatToParts(hijriCalcDate);
    const dayPart = parts.find((p) => p.type === 'day')?.value;
    const monthPart = parts.find((p) => p.type === 'month')?.value;
    const yearPart = parts.find((p) => p.type === 'year')?.value;

    if (dayPart && monthPart && yearPart) {
      hijriDay = parseInt(dayPart, 10) || 1;
      hijriMonth = monthPart;
      hijriYear = `${yearPart} AH`;
      hijriFormatted = `${hijriDay} ${hijriMonth} ${hijriYear}`;
      hijriShort = `${hijriDay} ${hijriMonth.length > 9 ? hijriMonth.slice(0, 8) + '…' : hijriMonth}`;
    } else {
      hijriFormatted = hijriFormatter.format(hijriCalcDate);
      hijriShort = hijriFormatted;
    }
  } catch {
    // Fallback if islamic-umalqura isn't supported in browser engine
    try {
      const fallbackFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone,
      });
      hijriFormatted = fallbackFormatter.format(hijriCalcDate);
      hijriShort = hijriFormatted;
    } catch {
      hijriFormatted = 'Hijri Date';
      hijriShort = 'Hijri';
    }
  }

  return {
    solarFormatted,
    solarShort,
    solarDayOfWeek,
    hijriFormatted,
    hijriShort,
    hijriDay,
    hijriMonth,
    hijriYear,
    timeZone,
    offsetDays: offset,
  };
}

export const getFormattedRegionalDate = getRegionalDateInfo;
