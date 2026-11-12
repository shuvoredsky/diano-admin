'use client';

import { useState } from 'react';
import { Sliders, AlertTriangle } from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { PermissionGate } from '@/components/shared/permission-gate';
import type { InventoryEntity } from '../types/inventory.types';
import { AdjustStockModal } from './adjust-stock-modal';

export interface StockTableProps {
  data: InventoryEntity[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function StockTable({
  data,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
}: StockTableProps) {
  const [adjustTarget, setAdjustTarget] = useState<{
    item: InventoryEntity;
    mode: 'ADJUST' | 'DAMAGE';
  } | null>(null);

  const columns: ColumnDef<InventoryEntity & Record<string, unknown>>[] = [
    {
      key: 'product',
      header: 'Product & Variant',
      render: row => {
        const productName = row.variant?.product?.name || 'Product';
        const variantName = row.variant?.name || 'Variant';
        const sku = row.variant?.sku || 'NO-SKU';
        const barcode = row.variant?.barcode;

        return (
          <div className="space-y-0.5 max-w-xs">
            <div className="font-semibold text-foreground truncate">{productName}</div>
            <div className="text-xs text-muted-foreground truncate">{variantName}</div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mt-0.5">
              <span>SKU: {sku}</span>
              {barcode && <span>• EAN: {barcode}</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: row => (
        <div className="text-xs font-medium text-foreground">
          {row.warehouse?.name || 'Main Warehouse'}
          <span className="block text-[10px] font-mono text-muted-foreground">
            {row.warehouse?.code || 'DEFAULT'}
          </span>
        </div>
      ),
    },
    {
      key: 'onHand',
      header: 'On Hand',
      render: row => (
        <span className="text-xs font-bold text-foreground">
          {row.onHand}
        </span>
      ),
    },
    {
      key: 'reserved',
      header: 'Reserved',
      render: row => (
        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          {row.reserved}
        </span>
      ),
    },
    {
      key: 'damaged',
      header: 'Damaged',
      render: row => (
        <span className="text-xs text-destructive font-medium">
          {row.damaged}
        </span>
      ),
    },
    {
      key: 'available',
      header: 'Available',
      render: row => (
        <span className="rounded-md bg-mint/50 dark:bg-mint/20 px-2 py-0.5 text-xs font-bold text-primary-deep dark:text-primary">
          {row.availableStock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Stock Status',
      render: row => {
        const isOutOfStock = row.availableStock <= 0;
        const reorderThreshold = row.variant?.reorderLevel ?? row.safetyStock ?? 5;
        const isLowStock = !isOutOfStock && row.availableStock <= reorderThreshold;

        if (isOutOfStock) {
          return <StatusBadge status="out of stock" variant="danger" />;
        }
        if (isLowStock) {
          return <StatusBadge status="low stock" variant="warning" />;
        }
        return <StatusBadge status="in stock" variant="success" />;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: row => (
        <PermissionGate permissions={['inventory:manage']}>
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setAdjustTarget({ item: row, mode: 'ADJUST' })}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Adjust stock quantity"
            >
              <Sliders className="h-3 w-3 text-muted-foreground" />
              <span>Adjust</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjustTarget({ item: row, mode: 'DAMAGE' })}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Report damaged items"
            >
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <span>Damage</span>
            </button>
          </div>
        </PermissionGate>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={data as (InventoryEntity & Record<string, unknown>)[]}
        columns={columns}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyTitle="No inventory items found"
        emptyDescription="There are no stock balances matching the current criteria."
      />

      {adjustTarget && (
        <AdjustStockModal
          item={adjustTarget.item}
          mode={adjustTarget.mode}
          onClose={() => setAdjustTarget(null)}
        />
      )}
    </>
  );
}

