import type { AnalyticsPeriod } from '@/features/analytics/types/analytics.types';

export type { AnalyticsPeriod };
export const DHAKA_TIMEZONE = 'Asia/Dhaka';
export const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000; // UTC+6 fixed offset

export interface DhakaDateParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number; // 0=Sun..6=Sat
}

/**
 * Returns year, month (1-12), day, hour, minute, second, dayOfWeek in Asia/Dhaka timezone.
 * Pure offset calculation independent of browser local timezone.
 */
export function getDhakaDateParts(date: Date = new Date()): DhakaDateParts {
  const dhakaMs = date.getTime() + DHAKA_OFFSET_MS;
  const dhakaDate = new Date(dhakaMs);

  return {
    year: dhakaDate.getUTCFullYear(),
    month: dhakaDate.getUTCMonth() + 1,
    day: dhakaDate.getUTCDate(),
    hour: dhakaDate.getUTCHours(),
    minute: dhakaDate.getUTCMinutes(),
    second: dhakaDate.getUTCSeconds(),
    dayOfWeek: dhakaDate.getUTCDay(),
  };
}

/**
 * Constructs a UTC Date object representing a specific calendar point in Asia/Dhaka.
 */
export function createDhakaDate(
  year: number,
  month: number, // 1-based (1-12)
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - 6, minute, second, ms));
}

export interface ResolvedPeriodRange {
  startDate: Date;
  endDate: Date;
  startDateIso: string;
  endDateIso: string;
  label: string;
}

/**
 * Formats a date into YYYY-MM-DD in Asia/Dhaka.
 */
export function formatDhakaDateOnly(date: Date): string {
  const parts = getDhakaDateParts(date);
  const m = String(parts.month).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  return `${parts.year}-${m}-${d}`;
}

/**
 * Resolves standard administrative reporting period boundaries strictly in Asia/Dhaka (UTC+6).
 * Aligns 1:1 with backend resolution in diano-server/src/modules/analytics/period.util.ts.
 */
export function resolveClientDhakaPeriod(
  period: AnalyticsPeriod,
  customFrom?: string,
  customTo?: string,
  referenceDate: Date = new Date()
): ResolvedPeriodRange {
  const dhaka = getDhakaDateParts(referenceDate);

  let start: Date;
  let end: Date;

  switch (period) {
    case 'today': {
      start = createDhakaDate(dhaka.year, dhaka.month, dhaka.day, 0, 0, 0, 0);
      end = createDhakaDate(dhaka.year, dhaka.month, dhaka.day + 1, 0, 0, 0, 0);
      break;
    }
    case 'yesterday': {
      start = createDhakaDate(dhaka.year, dhaka.month, dhaka.day - 1, 0, 0, 0, 0);
      end = createDhakaDate(dhaka.year, dhaka.month, dhaka.day, 0, 0, 0, 0);
      break;
    }
    case 'last_7_days': {
      end = createDhakaDate(dhaka.year, dhaka.month, dhaka.day + 1, 0, 0, 0, 0);
      start = createDhakaDate(dhaka.year, dhaka.month, dhaka.day - 6, 0, 0, 0, 0);
      break;
    }
    case 'last_30_days': {
      end = createDhakaDate(dhaka.year, dhaka.month, dhaka.day + 1, 0, 0, 0, 0);
      start = createDhakaDate(dhaka.year, dhaka.month, dhaka.day - 29, 0, 0, 0, 0);
      break;
    }
    case 'this_month': {
      start = createDhakaDate(dhaka.year, dhaka.month, 1, 0, 0, 0, 0);
      end = createDhakaDate(dhaka.year, dhaka.month + 1, 1, 0, 0, 0, 0);
      break;
    }
    case 'last_month': {
      start = createDhakaDate(dhaka.year, dhaka.month - 1, 1, 0, 0, 0, 0);
      end = createDhakaDate(dhaka.year, dhaka.month, 1, 0, 0, 0, 0);
      break;
    }
    case 'custom': {
      if (customFrom && customTo) {
        start = new Date(customFrom);
        end = new Date(customTo);
      } else {
        start = createDhakaDate(dhaka.year, dhaka.month, 1, 0, 0, 0, 0);
        end = createDhakaDate(dhaka.year, dhaka.month + 1, 1, 0, 0, 0, 0);
      }
      break;
    }
    default: {
      start = createDhakaDate(dhaka.year, dhaka.month, 1, 0, 0, 0, 0);
      end = createDhakaDate(dhaka.year, dhaka.month + 1, 1, 0, 0, 0, 0);
      break;
    }
  }

  return {
    startDate: start,
    endDate: end,
    startDateIso: formatDhakaDateOnly(start),
    endDateIso: formatDhakaDateOnly(new Date(end.getTime() - 1)),
    label: periodLabels[period] || period,
  };
}

export const periodLabels: Record<AnalyticsPeriod, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last_7_days: 'Last 7 Days',
  last_30_days: 'Last 30 Days',
  this_week: 'This Week',
  last_week: 'Last Week',
  this_month: 'This Month',
  last_month: 'Last Month',
  this_year: 'This Year',
  last_year: 'Last Year',
  custom: 'Custom Range',
};

export const SUPPORTED_DASHBOARD_PERIODS: Array<{ label: string; value: AnalyticsPeriod }> = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Custom Range', value: 'custom' },
];

/**
 * Calculates percentage delta between current and previous period.
 * Strict financial rule: If previous is zero, null, or undefined, returns null ("—", never NaN/Infinity).
 */
export function calculatePercentChange(
  current: number | null | undefined,
  previous: number | null | undefined
): number | null {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined ||
    previous === 0
  ) {
    return null;
  }

  const diff = current - previous;
  const percent = (diff / Math.abs(previous)) * 100;
  return Number.isFinite(percent) ? Number(percent.toFixed(1)) : null;
}

