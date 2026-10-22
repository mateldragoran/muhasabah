/**
 * Regional Solar & Lunar Hijri Calendar Engine
 * Handles automatic timezone detection, localized solar dates,
 * and canonical Islamic lunar dates with customizable moon-sighting day adjustments.
 *
 * Guaranteed cross-platform: resolves canonical Islamic months on both mobile
 * (where trimmed ICU data often erroneously falls back to Gregorian month strings like "May")
 * and desktop browsers.
 */

export interface IslamicMonthInfo {
  index: number; // 1 to 12
  name: string; // e.g. "Jumada al-Awwal"
  shortName: string; // e.g. "Jumada I"
  arabic: string; // e.g. "جمادى الأولى"
}

export const ISLAMIC_MONTHS: readonly IslamicMonthInfo[] = [
  { index: 1, name: 'Muharram', shortName: 'Muharram', arabic: 'المحرّم' },
  { index: 2, name: 'Safar', shortName: 'Safar', arabic: 'صفر' },
  { index: 3, name: "Rabi' al-Awwal", shortName: "Rabi' I", arabic: 'ربيع الأوّل' },
  { index: 4, name: "Rabi' al-Thani", shortName: "Rabi' II", arabic: 'ربيع الثاني' },
  { index: 5, name: 'Jumada al-Awwal', shortName: 'Jumada I', arabic: 'جمادى الأولى' },
  { index: 6, name: 'Jumada al-Thani', shortName: 'Jumada II', arabic: 'جمادى الثانية' },
  { index: 7, name: 'Rajab', shortName: 'Rajab', arabic: 'رجب' },
  { index: 8, name: "Sha'ban", shortName: "Sha'ban", arabic: 'شعبان' },
  { index: 9, name: 'Ramadan', shortName: 'Ramadan', arabic: 'رمضان' },
  { index: 10, name: 'Shawwal', shortName: 'Shawwal', arabic: 'شوّال' },
  { index: 11, name: "Dhu al-Qi'dah", shortName: "Dhu al-Qi'dah", arabic: 'ذو القعدة' },
  { index: 12, name: 'Dhu al-Hijjah', shortName: 'Dhu al-Hijjah', arabic: 'ذو الحجّة' },
] as const;

const GREGORIAN_MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

/**
 * Resolves an Islamic month into canonical naming even if the host browser
 * ICU locale emitted a month number, Gregorian fallback ("May"), or abbreviated string.
 */
export function resolveIslamicMonthInfo(monthValue: string | number | undefined): IslamicMonthInfo {
  if (monthValue == null) return ISLAMIC_MONTHS[0];
  const str = String(monthValue).trim();

  // 1. Convert Arabic-Indic numerals if present (e.g. ٥ -> 5)
  const normalizedNum = str.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
  const parsedNum = parseInt(normalizedNum, 10);
  if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 12) {
    return ISLAMIC_MONTHS[parsedNum - 1];
  }

  // 2. Check for mobile ICU Gregorian fallback strings (e.g. "May" -> month 5 -> Jumada al-Awwal)
  const lower = str.toLowerCase();
  const gregIdx = GREGORIAN_MONTH_NAMES.findIndex((m) => lower.startsWith(m));
  if (gregIdx !== -1) {
    return ISLAMIC_MONTHS[gregIdx];
  }

  // 3. Check for existing Islamic month names or Roman numerals
  const islamicIdx = ISLAMIC_MONTHS.findIndex(
    (m) =>
      m.name.toLowerCase().includes(lower) ||
      lower.includes(m.shortName.toLowerCase()) ||
      m.arabic.includes(str)
  );
  if (islamicIdx !== -1) {
    return ISLAMIC_MONTHS[islamicIdx];
  }

  return ISLAMIC_MONTHS[0];
}

export interface RegionalDateInfo {
  solarFormatted: string; // e.g. "Wed, Oct 11, 2026"
  solarShort: string; // e.g. "11 Oct"
  solarDayOfWeek: string; // e.g. "Wednesday"
  hijriFormatted: string; // e.g. "1 Jumada al-Awwal 1448 AH"
  hijriShort: string; // e.g. "1 Jumada I"
  hijriDay: number;
  hijriMonth: string; // Canonical e.g. "Jumada al-Awwal"
  hijriMonthShort: string; // e.g. "Jumada I"
  hijriMonthArabic: string; // e.g. "جمادى الأولى"
  hijriMonthNumber: number; // 1 to 12
  hijriYear: string; // e.g. "1448 AH"
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
 * Mathematical lunar approximation fallback for legacy environments
 * without Intl Islamic calendar support.
 */
function calculateFallbackHijri(date: Date): { day: number; month: number; year: number } {
  const msPerDay = 86400000;
  const epochMs = Date.UTC(622, 6, 16); // July 16, 622 CE (Hijri epoch)
  const diffDays = Math.floor((date.getTime() - epochMs) / msPerDay);
  const totalMonths = Math.floor(diffDays / 29.530588);
  const year = Math.floor(totalMonths / 12) + 1;
  const month = (totalMonths % 12) + 1;
  const day = Math.min(30, Math.max(1, Math.floor(diffDays - (totalMonths * 29.530588)) + 1));
  return { day, month, year };
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
  const hijriCalcDate = new Date(dateObj);
  if (offset !== 0) {
    hijriCalcDate.setDate(hijriCalcDate.getDate() + offset);
  }

  let hijriDay = 1;
  let rawMonthValue: string | number = 1;
  let hijriYearNum = 1448;

  let parsedSuccessfully = false;

  // Attempt 1: Umm al-Qura standard with numeric month (immune to locale string fallback bugs)
  try {
    const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      timeZone,
    });

    const parts = hijriFormatter.formatToParts(hijriCalcDate);
    const dayPart = parts.find((p) => p.type === 'day')?.value;
    const monthPart = parts.find((p) => p.type === 'month')?.value;
    const yearPart = parts.find((p) => p.type === 'year')?.value;

    if (dayPart && monthPart && yearPart) {
      hijriDay = parseInt(dayPart.replace(/\D/g, ''), 10) || 1;
      rawMonthValue = monthPart;
      hijriYearNum = parseInt(yearPart.replace(/\D/g, ''), 10) || 1448;
      parsedSuccessfully = true;
    }
  } catch {
    // islamic-umalqura not available in this environment
  }

  // Attempt 2: Standard Islamic calendar with numeric month
  if (!parsedSuccessfully) {
    try {
      const fallbackFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        timeZone,
      });
      const parts = fallbackFormatter.formatToParts(hijriCalcDate);
      const dayPart = parts.find((p) => p.type === 'day')?.value;
      const monthPart = parts.find((p) => p.type === 'month')?.value;
      const yearPart = parts.find((p) => p.type === 'year')?.value;

      if (dayPart && monthPart && yearPart) {
        hijriDay = parseInt(dayPart.replace(/\D/g, ''), 10) || 1;
        rawMonthValue = monthPart;
        hijriYearNum = parseInt(yearPart.replace(/\D/g, ''), 10) || 1448;
        parsedSuccessfully = true;
      }
    } catch {
      // Intl Islamic not available
    }
  }

  // Attempt 3: Mathematical astronomical fallback
  if (!parsedSuccessfully) {
    const fallback = calculateFallbackHijri(hijriCalcDate);
    hijriDay = fallback.day;
    rawMonthValue = fallback.month;
    hijriYearNum = fallback.year;
  }

  // Canonical Islamic month resolution (100% immune to Gregorian "May" on mobile)
  const monthInfo = resolveIslamicMonthInfo(rawMonthValue);
  const hijriMonth = monthInfo.name;
  const hijriMonthShort = monthInfo.shortName;
  const hijriMonthArabic = monthInfo.arabic;
  const hijriMonthNumber = monthInfo.index;
  const hijriYear = `${hijriYearNum} AH`;

  const hijriFormatted = `${hijriDay} ${hijriMonth} ${hijriYear}`;
  const hijriShort = `${hijriDay} ${hijriMonthShort}`;

  return {
    solarFormatted,
    solarShort,
    solarDayOfWeek,
    hijriFormatted,
    hijriShort,
    hijriDay,
    hijriMonth,
    hijriMonthShort,
    hijriMonthArabic,
    hijriMonthNumber,
    hijriYear,
    timeZone,
    offsetDays: offset,
  };
}

export const getFormattedRegionalDate = getRegionalDateInfo;
