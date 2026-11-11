import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatBdtAmount } from './money-text';
import { TrendingUp, TrendingDown, Minus, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { CardSkeleton } from '@/components/feedback/skeletons';

export type TrendDirection = 'UP' | 'DOWN' | 'FLAT' | 'NONE';
export type KpiPastel = 'lavender' | 'sky' | 'peach' | 'softgreen' | 'default';

export interface KpiCardProps {
  title: string;
  current?: string | number | null;
  previous?: string | number | null;
  change?: string | number | null;
  percent?: number | null;
  trend?: TrendDirection | string;
  note?: string | null;
  unit?: string | null;
  icon?: ReactNode;
  isCurrency?: boolean;
  pastel?: KpiPastel;
  loading?: boolean;
  error?: string | null;
  unavailable?: boolean;
  isRestricted?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function KpiCard({
  title,
  current,
  previous,
  percent,
  trend = 'NONE',
  note,
  unit,
  icon,
  isCurrency = false,
  pastel = 'default',
  loading = false,
  error = null,
  unavailable = false,
  isRestricted = false,
  onRetry,
  className,
}: KpiCardProps) {
  const pastelStyles: Record<KpiPastel, string> = {
    default: 'bg-card border-border',
    lavender: 'bg-pastel-lavender/40 border-pastel-lavender/60 dark:bg-card',
    sky: 'bg-pastel-sky/40 border-pastel-sky/60 dark:bg-card',
    peach: 'bg-pastel-peach/40 border-pastel-peach/60 dark:bg-card',
    softgreen: 'bg-pastel-softgreen/40 border-pastel-softgreen/60 dark:bg-card',
  };

  if (loading) {
    return <CardSkeleton className={cn(pastelStyles[pastel], className)} />;
  }

  if (error) {
    return (
      <div
        className={cn(
          'relative flex flex-col justify-between rounded-2xl border border-destructive/30 bg-destructive/5 p-5 shadow-2xs',
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-xs text-destructive uppercase tracking-wider">
            {title}
          </span>
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
        </div>
        <div className="my-3 text-xs text-destructive">
          <p className="line-clamp-2">{error}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-destructive hover:underline pt-1 border-t border-destructive/20 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        )}
      </div>
    );
  }

  const normalizedTrend: TrendDirection =
    typeof trend === 'string'
      ? (trend.toUpperCase() as TrendDirection)
      : 'NONE';

  const isRestrictedValue = isRestricted || (current === null && !unavailable);

  let formattedCurrent = '—';
  if (unavailable) {
    formattedCurrent = 'Unavailable';
  } else if (isRestrictedValue) {
    formattedCurrent = 'Restricted';
  } else if (current !== null && current !== undefined) {
    formattedCurrent = isCurrency
      ? `৳ ${formatBdtAmount(current)}`
      : typeof current === 'number'
        ? new Intl.NumberFormat('en-BD').format(current)
        : String(current);
  }

  const formattedPrevious =
    !unavailable && !isRestrictedValue && previous !== null && previous !== undefined
      ? isCurrency
        ? `৳ ${formatBdtAmount(previous)}`
        : typeof previous === 'number'
          ? new Intl.NumberFormat('en-BD').format(previous)
          : String(previous)
      : null;

  // Strict rule: null percent => "—"
  const formattedPercent =
    percent === null || percent === undefined
      ? '—'
      : `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;

  const trendColor = {
    UP: 'text-primary-deep bg-pastel-softgreen dark:text-primary',
    DOWN: 'text-destructive bg-destructive/10',
    FLAT: 'text-muted-foreground bg-muted',
    NONE: 'text-muted-foreground bg-muted',
  }[normalizedTrend] || 'text-muted-foreground bg-muted';

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-shadow hover:shadow-xs',
        pastelStyles[pastel],
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-background/80 text-foreground/80 shadow-2xs">
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-3 flex items-baseline gap-1.5">
        {isRestrictedValue ? (
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-lg">
            <Lock className="h-3.5 w-3.5 text-muted-foreground/80" />
            <span>Restricted Access</span>
          </div>
        ) : unavailable ? (
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
            <span>Unavailable</span>
          </div>
        ) : (
          <>
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {formattedCurrent}
            </span>
            {unit && <span className="text-xs text-muted-foreground font-medium">{unit}</span>}
          </>
        )}
      </div>

      {/* Trend & Comparison */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-xs text-muted-foreground">
        {!isRestrictedValue && !unavailable ? (
          <>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-[11px] tabular-nums',
                trendColor
              )}
            >
              {normalizedTrend === 'UP' && <TrendingUp className="h-3 w-3" />}
              {normalizedTrend === 'DOWN' && <TrendingDown className="h-3 w-3" />}
              {(normalizedTrend === 'FLAT' || normalizedTrend === 'NONE') && <Minus className="h-3 w-3" />}
              <span>{formattedPercent}</span>
            </span>

            {formattedPrevious && (
              <span className="truncate">vs {formattedPrevious}</span>
            )}

            {note && <span className="truncate text-muted-foreground/80">({note})</span>}
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground/70">
            {isRestrictedValue ? 'Requires analytics:view_finance permission' : 'Metric not available'}
          </span>
        )}
      </div>
    </div>
  );
}
