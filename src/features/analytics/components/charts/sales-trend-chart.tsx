'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartCard } from '@/components/shared/chart-card';
import { formatBdtAmount } from '@/components/shared/money-text';
import type { SalesTrendPoint } from '../../types/analytics.types';

export interface SalesTrendChartProps {
  data?: SalesTrendPoint[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function SalesTrendChart({
  data = [],
  loading = false,
  error = null,
  onRetry,
  className,
}: SalesTrendChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    formattedBucket: item.bucket.length > 10 ? item.bucket.slice(11, 16) : item.bucket.slice(5),
  }));

  const totalGross = data.reduce((sum, d) => sum + (d.grossSales || 0), 0);
  const totalNet = data.reduce((sum, d) => sum + (d.netSales || 0), 0);

  return (
    <ChartCard
      title="Sales & Revenue Trend"
      subtitle="Gross sales vs net sales progression over the period (Asia/Dhaka time)"
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
      emptyMessage="No sales recorded for this period."
      className={className}
    >
      <div className="h-[280px] w-full" aria-label="Sales and net sales trend chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grossSalesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#15965F" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#15965F" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="netSalesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#146B45" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#146B45" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
            <XAxis
              dataKey="formattedBucket"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const original = payload[0]?.payload as SalesTrendPoint;
                  return (
                    <div className="rounded-xl border border-border bg-popover/95 p-3 shadow-md backdrop-blur-xs text-xs">
                      <p className="font-semibold text-foreground mb-1">{original?.bucket || label}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4 text-primary">
                          <span>Gross:</span>
                          <span className="font-bold">৳ {formatBdtAmount(original?.grossSales)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-primary-deep dark:text-primary">
                          <span>Net:</span>
                          <span className="font-bold">৳ {formatBdtAmount(original?.netSales)}</span>
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
              wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
            />
            <Area
              type="monotone"
              dataKey="grossSales"
              name="Gross Sales"
              stroke="#15965F"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#grossSalesGrad)"
            />
            <Area
              type="monotone"
              dataKey="netSales"
              name="Net Sales"
              stroke="#146B45"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#netSalesGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Screen reader & summary text */}
      <div className="sr-only">
        Period total gross sales: ৳ {totalGross.toFixed(2)}, total net sales: ৳ {totalNet.toFixed(2)}.
      </div>
    </ChartCard>
  );
}

