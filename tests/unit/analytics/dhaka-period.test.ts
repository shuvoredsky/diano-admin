import { describe, expect, it } from 'vitest';
import {
  getDhakaDateParts,
  createDhakaDate,
  resolveClientDhakaPeriod,
  calculatePercentChange,
  formatDhakaDateOnly,
  DHAKA_OFFSET_MS,
} from '@/lib/utils/dhaka-period';

describe('Asia/Dhaka Period Calculations & Boundary Rules', () => {
  it('correctly calculates Dhaka date parts regardless of browser timezone', () => {
    // 2026-11-12T01:30:00Z is 07:30:00 in Dhaka (UTC+6)
    const utcDate = new Date('2026-11-12T01:30:00.000Z');
    const dhakaParts = getDhakaDateParts(utcDate);

    expect(dhakaParts.year).toBe(2026);
    expect(dhakaParts.month).toBe(11);
    expect(dhakaParts.day).toBe(12);
    expect(dhakaParts.hour).toBe(7);
    expect(dhakaParts.minute).toBe(30);
  });

  it('correctly handles month boundaries in Asia/Dhaka', () => {
    // 2026-11-01T00:00:00 in Dhaka is 2026-10-31T18:00:00Z
    const dhakaMidnight = createDhakaDate(2026, 11, 1, 0, 0, 0);
    expect(dhakaMidnight.toISOString()).toBe('2026-10-31T18:00:00.000Z');

    const parts = getDhakaDateParts(dhakaMidnight);
    expect(parts.month).toBe(11);
    expect(parts.day).toBe(1);
    expect(parts.hour).toBe(0);
  });

  it('resolves "today" period boundaries in Asia/Dhaka', () => {
    // Reference date: 2026-11-12 14:00:00 Dhaka
    const ref = createDhakaDate(2026, 11, 12, 14, 0, 0);
    const resolved = resolveClientDhakaPeriod('today', undefined, undefined, ref);

    expect(resolved.startDateIso).toBe('2026-11-12');
    expect(resolved.startDate.toISOString()).toBe('2026-11-11T18:00:00.000Z'); // 00:00 Dhaka
    expect(resolved.endDate.toISOString()).toBe('2026-11-12T18:00:00.000Z'); // 24:00 / next midnight Dhaka
  });

  it('resolves "yesterday" period boundaries in Asia/Dhaka', () => {
    const ref = createDhakaDate(2026, 11, 12, 14, 0, 0);
    const resolved = resolveClientDhakaPeriod('yesterday', undefined, undefined, ref);

    expect(resolved.startDateIso).toBe('2026-11-11');
    expect(resolved.startDate.toISOString()).toBe('2026-11-10T18:00:00.000Z');
    expect(resolved.endDate.toISOString()).toBe('2026-11-11T18:00:00.000Z');
  });

  it('resolves "this_month" boundaries accurately in Dhaka', () => {
    const ref = createDhakaDate(2026, 11, 12, 14, 0, 0);
    const resolved = resolveClientDhakaPeriod('this_month', undefined, undefined, ref);

    expect(resolved.startDateIso).toBe('2026-11-01');
    expect(resolved.startDate.toISOString()).toBe('2026-10-31T18:00:00.000Z'); // Nov 1 00:00 Dhaka
    expect(resolved.endDate.toISOString()).toBe('2026-11-30T18:00:00.000Z'); // Dec 1 00:00 Dhaka
  });

  it('resolves "last_month" boundaries accurately in Dhaka across year/month boundaries', () => {
    // Test January boundary: reference Jan 15, 2026
    const refJan = createDhakaDate(2026, 1, 15, 10, 0, 0);
    const resolvedJan = resolveClientDhakaPeriod('last_month', undefined, undefined, refJan);

    expect(resolvedJan.startDateIso).toBe('2025-12-01');
    expect(resolvedJan.startDate.toISOString()).toBe('2025-11-30T18:00:00.000Z');
  });

  describe('Percent Change Financial Calculation', () => {
    it('returns positive and negative percentage deltas', () => {
      expect(calculatePercentChange(120, 100)).toBe(20.0);
      expect(calculatePercentChange(80, 100)).toBe(-20.0);
      expect(calculatePercentChange(150, 120)).toBe(25.0);
    });

    it('returns null when previous value is zero (never Infinity)', () => {
      expect(calculatePercentChange(100, 0)).toBeNull();
      expect(calculatePercentChange(0, 0)).toBeNull();
    });

    it('returns null when either value is null or undefined', () => {
      expect(calculatePercentChange(null, 100)).toBeNull();
      expect(calculatePercentChange(100, null)).toBeNull();
      expect(calculatePercentChange(undefined, undefined)).toBeNull();
    });
  });
});

