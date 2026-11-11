import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { isValid, parseISO } from 'date-fns';

export const DHAKA_TIMEZONE = 'Asia/Dhaka' as const;

/**
 * Converts a UTC Date or ISO-8601 string into an Asia/Dhaka zoned Date instance
 * using date-fns-tz without manual offset math.
 */
export function toDhakaDate(input: Date | string | number): Date {
  const dateObj = typeof input === 'string' ? parseISO(input) : new Date(input);
  if (!isValid(dateObj)) {
    throw new Error('Invalid date value provided to toDhakaDate');
  }
  return toZonedTime(dateObj, DHAKA_TIMEZONE);
}

/**
 * Formats a UTC Date or ISO-8601 string in the Asia/Dhaka timezone.
 */
export function formatDhakaDateTime(
  input: Date | string | number,
  pattern = 'dd MMM yyyy, hh:mm a',
): string {
  const dateObj = typeof input === 'string' ? parseISO(input) : new Date(input);
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }
  return formatInTimeZone(dateObj, DHAKA_TIMEZONE, pattern);
}

/**
 * Formats a calendar date in the Asia/Dhaka timezone (e.g. "10 Nov 2026").
 */
export function formatDhakaDate(input: Date | string | number, pattern = 'dd MMM yyyy'): string {
  return formatDhakaDateTime(input, pattern);
}

