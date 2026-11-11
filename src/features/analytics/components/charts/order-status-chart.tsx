'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartCard } from '@/components/shared/chart-card';
import type { OrderStatusPoint } from '../../types/analytics.types';

export interface OrderStatusChartProps {
  data?: OrderStatusPoint[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#15965F',
  CONFIRMED: '#0284C7',
  PROCESSING: '#6366F1',
  SHIPPED: '#8B5CF6',
  PACKED: '#EC4899',
  PENDING: '#F59E0B',
  CANCELLED: '#EF4444',
  RETURNED: '#F97316',
  REFUNDED: '#64748B',
};

export function OrderStatusChart({
  data = [],
  loading = false,
  error = null,
  onRetry,
  className,
}: OrderStatusChartProps) {
  const totalOrders = data.reduce((sum, d) => sum + (d.count || 0), 0);

  return (
    <ChartCard
      title="Order Status Breakdown"
      subtitle="Volume distribution by order lifecycle state"
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
      emptyMessage="No order status records found for this period."
      className={className}
    >
      <div className="h-[280px] w-full" aria-label="Order distribution by fulfillment status">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="bucket"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.bucket}
                  fill={STATUS_COLORS[entry.bucket] || '#94A3B8'}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0]?.payload as OrderStatusPoint;
                  const percent = totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(1) : '0';
                  return (
                    <div className="rounded-xl border border-border bg-popover/95 p-2.5 shadow-md text-xs">
                      <p className="font-semibold text-foreground">{item.bucket}</p>
                      <p className="text-muted-foreground">
                        <span className="font-bold text-foreground">{item.count}</span> orders ({percent}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="sr-only">
        Total orders: {totalOrders}. Statuses: {data.map((d) => `${d.bucket}: ${d.count}`).join(', ')}.
      </div>
    </ChartCard>
  );
}

