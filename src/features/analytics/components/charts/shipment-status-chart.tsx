'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartCard } from '@/components/shared/chart-card';
import type { ShipmentStatusPoint } from '../../types/analytics.types';

export interface ShipmentStatusChartProps {
  data?: ShipmentStatusPoint[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

const SHIPMENT_STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#15965F',
  IN_TRANSIT: '#0284C7',
  OUT_FOR_DELIVERY: '#6366F1',
  MANIFESTED: '#8B5CF6',
  PICKED_UP: '#F59E0B',
  FAILED: '#EF4444',
  RETURNED: '#F97316',
  CANCELLED: '#64748B',
};

export function ShipmentStatusChart({
  data = [],
  loading = false,
  error = null,
  onRetry,
  className,
}: ShipmentStatusChartProps) {
  const totalShipments = data.reduce((sum, d) => sum + (d.count || 0), 0);

  return (
    <ChartCard
      title="Shipment Status"
      subtitle="Fulfillment logistics and courier delivery outcomes"
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
      emptyMessage="No shipments recorded for this period."
      className={className}
    >
      <div className="h-[280px] w-full" aria-label="Shipment status performance">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.6} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              type="category"
              dataKey="status"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              width={90}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0]?.payload as ShipmentStatusPoint;
                  return (
                    <div className="rounded-xl border border-border bg-popover/95 p-2.5 shadow-md text-xs">
                      <p className="font-semibold text-foreground">{item.status}</p>
                      <p className="text-muted-foreground">
                        <span className="font-bold text-foreground">{item.count}</span> shipments ({item.percent}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={24}>
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={SHIPMENT_STATUS_COLORS[entry.status] || '#15965F'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="sr-only">
        Total shipments: {totalShipments}.
      </div>
    </ChartCard>
  );
}

