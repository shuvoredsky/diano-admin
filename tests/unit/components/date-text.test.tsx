import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DateText, formatDateDhaka } from '@/components/shared/date-text';

describe('formatDateDhaka utility', () => {
  it('formats dates in Asia/Dhaka (UTC+6) timezone', () => {
    // 2026-11-11T12:00:00Z is 2026-11-11 18:00 (06:00 PM) in Asia/Dhaka
    const utcIso = '2026-11-11T12:00:00.000Z';
    const formattedDate = formatDateDhaka(utcIso, 'date');
    expect(formattedDate).toBe('11 Nov 2026');

    const formattedTime = formatDateDhaka(utcIso, 'time');
    expect(formattedTime).toBe('06:00 PM');
  });

  it('returns fallback dash for null, undefined, or invalid dates', () => {
    expect(formatDateDhaka(null)).toBe('—');
    expect(formatDateDhaka(undefined)).toBe('—');
    expect(formatDateDhaka('invalid-date-string')).toBe('—');
  });
});

describe('DateText Component', () => {
  it('renders formatted date in Asia/Dhaka timezone', () => {
    render(<DateText date="2026-11-11T14:30:00.000Z" format="date" />);
    // 14:30 UTC + 6 hours = 20:30 (8:30 PM) on 11 Nov 2026
    expect(screen.getByText('11 Nov 2026')).toBeInTheDocument();
  });

  it('renders BST timezone indicator when showTimezone is true', () => {
    render(<DateText date="2026-11-11T14:30:00.000Z" format="time" showTimezone />);
    expect(screen.getByText('BST')).toBeInTheDocument();
  });

  it('renders custom fallback for empty date input', () => {
    render(<DateText date={null} fallback="No date available" />);
    expect(screen.getByText('No date available')).toBeInTheDocument();
  });
});
