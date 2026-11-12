'use client';

import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import { DateText } from '@/components/shared/date-text';
import { StatusBadge } from '@/components/shared/status-badge';
import type { StockMovementEntity, StockMovementType } from '../types/inventory.types';

export interface StockMovementsTableProps {
  data: StockMovementEntity[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function StockMovementsTable({
  data,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
}: StockMovementsTableProps) {
  const getMovementVariant = (type: StockMovementType): 'success' | 'danger' | 'warning' | 'neutral' => {
    switch (type) {
      case 'PURCHASE_RECEIPT':
      case 'RETURN_RESTOCK':
      case 'TRANSFER_IN':
        return 'success';
      case 'ORDER_FULFILLMENT':
      case 'DAMAGE_ADJUSTMENT':
      case 'TRANSFER_OUT':
        return 'danger';
      case 'AUDIT_ADJUSTMENT':
      case 'MANUAL_ADJUSTMENT':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const columns: ColumnDef<StockMovementEntity & Record<string, unknown>>[] = [
    {
      key: 'createdAt',
      header: 'Date & Time (Dhaka)',
      render: row => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          <DateText date={row.createdAt} format="datetime" showTimezone />
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Movement Type',
      render: row => (
        <StatusBadge
          status={row.type.replace(/_/g, ' ').toLowerCase()}
          variant={getMovementVariant(row.type)}
        />
      ),
    },
    {
      key: 'variant',
      header: 'Variant',
      render: row => (
        <div className="space-y-0.5 max-w-xs">
          <div className="text-xs font-semibold text-foreground truncate">
            {row.variant?.name || 'Variant'}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">
            {row.variant?.sku || row.variantId}
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Delta',
      render: row => {
        const isPositive = row.quantity > 0;
        return (
          <span
            className={`font-mono text-xs font-bold ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-destructive'
            }`}
          >
            {isPositive ? `+${row.quantity}` : `${row.quantity}`}
          </span>
        );
      },
    },
    {
      key: 'balance',
      header: 'Balance',
      render: row => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.quantityBefore} &rarr; <strong className="text-foreground">{row.quantityAfter}</strong>
        </span>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      render: row => (
        <div className="text-xs">
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground">
            {row.referenceType}
          </span>
          <span className="ml-1 font-mono text-[11px] text-muted-foreground">
            #{row.referenceId}
          </span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason / Notes',
      render: row => (
        <p className="text-xs text-muted-foreground max-w-xs truncate" title={row.reason}>
          {row.reason}
        </p>
      ),
    },
  ];

  return (
    <DataTable
      data={data as (StockMovementEntity & Record<string, unknown>)[]}
      columns={columns}
      total={total}
      page={page}
      limit={limit}
      isLoading={isLoading}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      emptyTitle="No stock movements recorded"
      emptyDescription="The immutable inventory audit ledger has no transactions matching this period."
    />
  );
}

