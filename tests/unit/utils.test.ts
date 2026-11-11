import { describe, expect, it } from 'vitest';

import { validatePublicEnv } from '@/config/env';
import { DHAKA_TIMEZONE, formatDhakaDate, formatDhakaDateTime } from '@/lib/dates/dhaka-date';
import { cn } from '@/lib/utils/cn';
import { formatBdt } from '@/lib/utils/currency';

describe('Utility & Environment Helpers', () => {
  it('merges Tailwind classes deterministically via cn()', () => {
    const isHidden = false;
    expect(cn('px-2 py-1', 'px-4', isHidden && 'hidden')).toBe('py-1 px-4');
  });

  it('formats BDT currency values accurately', () => {
    expect(formatBdt(1500)).toContain('৳');
    expect(formatBdt('2499.50')).toContain('2,499.50');
    expect(formatBdt(null)).toBe('৳0.00');
  });

  it('formats timestamps in Asia/Dhaka timezone (+06:00)', () => {
    const utcMidnight = '2026-01-15T00:00:00.000Z';
    expect(DHAKA_TIMEZONE).toBe('Asia/Dhaka');
    expect(formatDhakaDate(utcMidnight)).toBe('15 Jan 2026');
    expect(formatDhakaDateTime(utcMidnight)).toBe('15 Jan 2026, 06:00 AM');
  });

  it('validates public environment configuration with defaults', () => {
    const parsed = validatePublicEnv({});
    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3001');
    expect(parsed.NEXT_PUBLIC_API_BASE_URL).toBe('http://localhost:5000/api/v1');
  });
});
