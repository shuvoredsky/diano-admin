'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartCard } from '@/components/shared/chart-card';
import type { StockBySubcategoryPoint } from '../../types/analytics.types';

export interface StockSubcategoryChartProps {
  data?: StockBySubcategoryPoint[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function StockSubcategoryChart({
  data = [],
  loading = false,
  error = null,
  onRetry,
  className,
}: StockSubcategoryChartProps) {
  // Take top 8 categories by stock for readability
  const displayData = data.slice(0, 8).map((d) => ({
    ...d,
    shortName: d.categoryName.length > 14 ? `${d.categoryName.slice(0, 12)}…` : d.categoryName,
  }));

  return (
    <ChartCard
      title="Stock by Subcategory"
      subtitle="Available vs damaged inventory units by category"
      loading={loading}
      error={error}
      actions={
        onRetry && error ? (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Retry
          </button>
        ) : undefined
      }
      empty={!loading && !error && data.length === 0}
      emptyMessage="No category stock records available."
      className={className}
    >
      <div className="h-[280px] w-full" aria-label="Stock levels by subcategory">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
            <XAxis
              dataKey="shortName"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0]?.payload as StockBySubcategoryPoint;
                  return (
                    <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-md text-xs">
                      <p className="font-semibold text-foreground mb-1">{item.bucket}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4 text-primary">
                          <span>Available:</span>
                          <span className="font-bold">{item.availableUnits} units</span>
                        </div>
                        <div className="flex justify-between gap-4 text-destructive">
                          <span>Damaged:</span>
                          <span className="font-bold">{item.damagedUnits} units</span>
                        </div>
                        <div className="flex justify-between gap-4 text-muted-foreground border-t border-border/40 pt-1">
                          <span>On Hand:</span>
                          <span className="font-bold">{item.onHandUnits} units</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
            />
            <Bar dataKey="availableUnits" name="Available" fill="#15965F" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="damagedUnits" name="Damaged" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="sr-only">
        Stock by subcategory: {data.map((d) => `${d.categoryName}: ${d.availableUnits} available`).join(', ')}.
      </div>
    </ChartCard>
  );
}

