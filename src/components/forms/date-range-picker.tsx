'use client';

import { useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { subDays, startOfMonth } from 'date-fns';
import { DHAKA_TIMEZONE } from '@/components/shared/date-text';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const now = new Date();

  const getDhakaIso = (d: Date) => formatInTimeZone(d, DHAKA_TIMEZONE, 'yyyy-MM-dd');

  const todayIso = getDhakaIso(now);
  const currentRange = value || {
    startDate: getDhakaIso(subDays(now, 30)),
    endDate: todayIso,
  };

  const presets = [
    {
      label: 'Today',
      range: { startDate: todayIso, endDate: todayIso },
    },
    {
      label: 'Yesterday',
      range: {
        startDate: getDhakaIso(subDays(now, 1)),
        endDate: getDhakaIso(subDays(now, 1)),
      },
    },
    {
      label: 'Last 7 Days',
      range: {
        startDate: getDhakaIso(subDays(now, 7)),
        endDate: todayIso,
      },
    },
    {
      label: 'Last 30 Days',
      range: {
        startDate: getDhakaIso(subDays(now, 30)),
        endDate: todayIso,
      },
    },
    {
      label: 'This Month',
      range: {
        startDate: getDhakaIso(startOfMonth(now)),
        endDate: todayIso,
      },
    },
  ];

  const handleSelectPreset = (range: DateRange) => {
    if (onChange) {
      onChange(range);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className || ''}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 gap-2 rounded-lg border-border text-xs font-normal"
        aria-expanded={isOpen}
      >
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="tabular-nums">
          {currentRange.startDate} — {currentRange.endDate}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-72 rounded-xl border border-border bg-card p-3 shadow-xl glass-floating">
          <div className="mb-2.5 pb-2 border-b border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Dhaka Time Presets (GMT+6)
            </span>
          </div>

          <div className="space-y-1 mb-3">
            {presets.map(p => {
              const isSelected =
                currentRange.startDate === p.range.startDate &&
                currentRange.endDate === p.range.endDate;

              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(p.range)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isSelected
                      ? 'bg-mint text-primary-deep font-semibold'
                      : 'text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span>{p.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary-deep" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border/60 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Custom Range
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">Start</label>
                <input
                  type="date"
                  value={currentRange.startDate}
                  onChange={e => {
                    const newRange = { ...currentRange, startDate: e.target.value };
                    if (onChange) onChange(newRange);
                  }}
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">End</label>
                <input
                  type="date"
                  value={currentRange.endDate}
                  onChange={e => {
                    const newRange = { ...currentRange, endDate: e.target.value };
                    if (onChange) onChange(newRange);
                  }}
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
