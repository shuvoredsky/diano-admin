import type { HTMLAttributes } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';

export const DHAKA_TIMEZONE = 'Asia/Dhaka';

export type DateTextFormat =
  | 'date' // e.g. 11 Nov 2026
  | 'datetime' // e.g. 11 Nov 2026, 08:30 PM
  | 'time' // e.g. 08:30 PM
  | 'short' // e.g. 11/11/2026
  | 'relative' // e.g. 2 hours ago
  | 'iso'; // e.g. 2026-11-11

export interface DateTextProps extends HTMLAttributes<HTMLSpanElement> {
  date: string | Date | number | null | undefined;
  format?: DateTextFormat | string;
  fallback?: string;
  showTimezone?: boolean;
}

export function formatDateDhaka(
  dateInput: string | Date | number | null | undefined,
  formatType: DateTextFormat | string = 'datetime'
): string {
  if (!dateInput) return '—';

  try {
    const dateObj = typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;

    if (isNaN(dateObj.getTime())) return '—';

    if (formatType === 'relative') {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }

    const formatStringMap: Record<DateTextFormat, string> = {
      date: 'dd MMM yyyy',
      datetime: 'dd MMM yyyy, hh:mm a',
      time: 'hh:mm a',
      short: 'dd/MM/yyyy',
      relative: '',
      iso: 'yyyy-MM-dd',
    };

    const pattern = formatStringMap[formatType as DateTextFormat] || formatType;
    return formatInTimeZone(dateObj, DHAKA_TIMEZONE, pattern);
  } catch {
    return '—';
  }
}

export function DateText({
  date,
  format = 'datetime',
  fallback = '—',
  showTimezone = false,
  className,
  ...props
}: DateTextProps) {
  const formatted = formatDateDhaka(date, format);
  const displayValue = formatted === '—' ? fallback : formatted;

  return (
    <span
      className={cn('tabular-nums inline-flex items-center text-inherit', className)}
      title={date ? String(date) : undefined}
      {...props}
    >
      <span>{displayValue}</span>
      {showTimezone && formatted !== '—' && (
        <span className="ml-1 text-[10px] text-muted-foreground uppercase">BST</span>
      )}
    </span>
  );
}
