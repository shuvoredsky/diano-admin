'use client';

import { useDashboardPeriod } from '../hooks/use-dashboard-period';
import {
  SUPPORTED_DASHBOARD_PERIODS,
  type AnalyticsPeriod,
} from '@/lib/utils/dhaka-period';
import { Calendar, ArrowRightLeft, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DashboardPeriodSelectorProps {
  className?: string;
}

export function DashboardPeriodSelector({ className }: DashboardPeriodSelectorProps) {
  const {
    period,
    compare,
    from,
    to,
    setPeriod,
    setCompare,
    setCustomRange,
    resolvedRange,
  } = useDashboardPeriod();

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 bg-card border border-border/80 rounded-2xl p-2.5 shadow-2xs',
        className
      )}
    >
      {/* Period Dropdown */}
      <div className="relative flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary shrink-0 ml-1.5" />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}
          className="h-9 appearance-none rounded-xl bg-background px-3 py-1.5 pr-8 text-xs font-semibold text-foreground border border-border hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
          aria-label="Select reporting period"
        >
          {SUPPORTED_DASHBOARD_PERIODS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Range Inputs if custom is selected */}
      {period === 'custom' && (
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={from || resolvedRange.startDateIso}
            onChange={(e) => setCustomRange(e.target.value, to || resolvedRange.endDateIso)}
            className="h-9 rounded-xl border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Custom start date"
          />
          <span className="text-muted-foreground font-medium">to</span>
          <input
            type="date"
            value={to || resolvedRange.endDateIso}
            onChange={(e) => setCustomRange(from || resolvedRange.startDateIso, e.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Custom end date"
          />
        </div>
      )}

      {/* Compare Toggle */}
      <div className="h-5 w-px bg-border/60 hidden sm:block" />

      <button
        type="button"
        onClick={() => setCompare(!compare)}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border cursor-pointer',
          compare
            ? 'bg-primary/10 text-primary-deep dark:text-primary border-primary/30 shadow-2xs'
            : 'bg-background text-muted-foreground border-border hover:bg-muted/50'
        )}
        aria-pressed={compare}
        aria-label="Toggle comparison to previous period"
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
        <span>Compare previous</span>
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            compare ? 'bg-primary' : 'bg-muted-foreground/40'
          )}
        />
      </button>

      {/* Dhaka Timezone Indicator Badge */}
      <div className="ml-auto hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg">
        <Clock className="h-3 w-3 text-muted-foreground/70" />
        <span>Asia/Dhaka (UTC+6): {resolvedRange.startDateIso} to {resolvedRange.endDateIso}</span>
      </div>
    </div>
  );
}

