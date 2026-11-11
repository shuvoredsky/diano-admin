'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AnalyticsPeriod } from '../types/analytics.types';
import {
  resolveClientDhakaPeriod,
  SUPPORTED_DASHBOARD_PERIODS,
} from '@/lib/utils/dhaka-period';

const VALID_PERIODS = new Set<string>(
  SUPPORTED_DASHBOARD_PERIODS.map((p) => p.value)
);

export function useDashboardPeriod() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const periodParam = searchParams.get('period');
  const period: AnalyticsPeriod =
    periodParam && VALID_PERIODS.has(periodParam)
      ? (periodParam as AnalyticsPeriod)
      : 'this_month';

  const compareParam = searchParams.get('compare');
  // Default compare is true per backend contract default
  const compare: boolean = compareParam !== 'false';

  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;

  const resolvedRange = useMemo(() => {
    return resolveClientDhakaPeriod(period, from, to);
  }, [period, from, to]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      }

      const queryString = nextParams.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const setPeriod = useCallback(
    (newPeriod: AnalyticsPeriod) => {
      if (newPeriod === 'custom') {
        updateQueryParams({
          period: 'custom',
          from: resolvedRange.startDateIso,
          to: resolvedRange.endDateIso,
        });
      } else {
        updateQueryParams({
          period: newPeriod,
          from: null,
          to: null,
        });
      }
    },
    [updateQueryParams, resolvedRange]
  );

  const setCompare = useCallback(
    (enabled: boolean) => {
      updateQueryParams({
        compare: enabled ? 'true' : 'false',
      });
    },
    [updateQueryParams]
  );

  const setCustomRange = useCallback(
    (customFrom: string, customTo: string) => {
      updateQueryParams({
        period: 'custom',
        from: customFrom,
        to: customTo,
      });
    },
    [updateQueryParams]
  );

  return {
    period,
    compare,
    from,
    to,
    setPeriod,
    setCompare,
    setCustomRange,
    resolvedRange,
  };
}

