'use client';

import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  PAYMENT_STATUS_VARIANTS,
} from '../constants/orders.constants';
import type { OrderEntity } from '../types/orders.types';

export interface OrdersTableProps {
  data: OrderEntity[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewOrder: (order: OrderEntity) => void;
}

export function OrdersTable({
  data,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
  onViewOrder,
}: OrdersTableProps) {
  const columns: ColumnDef<OrderEntity>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (row: OrderEntity) => (
        <span className="font-mono text-xs font-bold text-foreground">
          #{row.orderNumber}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row: OrderEntity) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground text-xs">
            {row.customerSnapshot?.name || 'Customer'}
          </div>
          <div className="flex items-center gap-1.5 text-2xs text-muted-foreground font-mono">
            <span>{row.customerSnapshot?.phone}</span>
            {row.customerSnapshot?.isGuest && (
              <span className="rounded bg-muted px-1 py-0.2 text-[9px] font-semibold uppercase text-muted-foreground">
                Guest
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'placedAt',
      header: 'Date Placed',
      render: (row: OrderEntity) => (
        <span className="text-xs text-muted-foreground">
          <DateText date={row.placedAt || row.createdAt} format="datetime" />
        </span>
      ),
    },
    {
      key: 'itemsCount',
      header: 'Items',
      align: 'center',
      render: (row: OrderEntity) => (
        <span className="text-xs text-muted-foreground">
          {row.items?.length || 0} line{row.items?.length === 1 ? '' : 's'}
        </span>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (row: OrderEntity) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge
            status={row.paymentStatus}
            variant={PAYMENT_STATUS_VARIANTS[row.paymentStatus] || 'neutral'}
          />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            {row.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Order Status',
      render: (row: OrderEntity) => (
        <StatusBadge
          status={row.status}
          label={ORDER_STATUS_LABELS[row.status] || row.status}
          variant={ORDER_STATUS_VARIANTS[row.status] || 'neutral'}
        />
      ),
    },
    {
      key: 'grandTotal',
      header: 'Total Value',
      render: (row: OrderEntity) => (
        <span className="font-mono text-xs font-bold text-foreground">
          <MoneyText amount={row.grandTotal} />
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row: OrderEntity) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewOrder(row)}
          className="gap-1.5 text-xs h-8"
          title={`View details for #${row.orderNumber}`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Details</span>
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      total={total}
      page={page}
      limit={limit}
      isLoading={isLoading}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      emptyTitle="No orders found"
      emptyDescription="Customer checkouts and completed transactions will appear here."
    />
  );
}
