'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import type { PurchaseOrderEntity, PurchaseOrderStatus } from '../types/purchases.types';
import { PurchaseOrderDetailModal } from './purchase-order-detail-modal';

export interface PurchaseOrdersTableProps {
  data: PurchaseOrderEntity[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function PurchaseOrdersTable({
  data,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
}: PurchaseOrdersTableProps) {
  const [selectedPo, setSelectedPo] = useState<PurchaseOrderEntity | null>(null);

  const getStatusVariant = (st: PurchaseOrderStatus) => {
    switch (st) {
      case 'RECEIVED':
        return 'success';
      case 'PARTIALLY_RECEIVED':
      case 'ORDERED':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const columns: ColumnDef<PurchaseOrderEntity & Record<string, unknown>>[] = [
    {
      key: 'poNumber',
      header: 'PO Number',
      render: row => (
        <span className="font-mono text-xs font-bold text-foreground">
          #{row.poNumber}
        </span>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: row => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground text-xs">{row.supplier?.name}</div>
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            {row.supplier?.code}
          </span>
        </div>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: row => (
        <span className="text-xs text-muted-foreground">
          {row.warehouse?.name || 'Main Warehouse'}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Value',
      render: row => (
        <span className="font-mono text-xs font-bold text-foreground">
          <MoneyText amount={row.totalAmount} />
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: row => (
        <StatusBadge
          status={row.status.replace(/_/g, ' ').toLowerCase()}
          variant={getStatusVariant(row.status)}
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Date Created',
      render: row => (
        <span className="text-xs text-muted-foreground">
          <DateText date={row.createdAt} format="date" />
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setSelectedPo(row)}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="View purchase order details and timeline"
            aria-label={`View details for ${row.poNumber}`}
          >
            <Eye className="h-3 w-3 text-muted-foreground" />
            <span>Details</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={data as (PurchaseOrderEntity & Record<string, unknown>)[]}
        columns={columns}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyTitle="No purchase orders found"
        emptyDescription="Create procurement orders to replenish inventory with suppliers."
      />

      {selectedPo && (
        <PurchaseOrderDetailModal
          po={selectedPo}
          isOpen={Boolean(selectedPo)}
          onClose={() => setSelectedPo(null)}
        />
      )}
    </>
  );
}

