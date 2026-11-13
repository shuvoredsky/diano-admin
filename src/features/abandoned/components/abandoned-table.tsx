'use client';

import { Eye, Smartphone, Monitor, Tablet, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import {
  CHECKOUT_STATUS_LABELS,
  CHECKOUT_STATUS_VARIANTS,
} from '../constants/abandoned.constants';
import type {
  AbandonedCheckoutSessionItem,
  DeviceCategory,
} from '../types/abandoned.types';

export interface AbandonedTableProps {
  data: AbandonedCheckoutSessionItem[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewSession: (session: AbandonedCheckoutSessionItem) => void;
}

function getDeviceIcon(category: DeviceCategory) {
  switch (category) {
    case 'MOBILE':
      return <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />;
    case 'TABLET':
      return <Tablet className="h-3.5 w-3.5 text-muted-foreground" />;
    case 'DESKTOP':
      return <Monitor className="h-3.5 w-3.5 text-muted-foreground" />;
    default:
      return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

export function AbandonedTable({
  data,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
  onViewSession,
}: AbandonedTableProps) {
  const columns: ColumnDef<AbandonedCheckoutSessionItem>[] = [
    {
      key: 'sessionId',
      header: 'Session ID',
      render: (row: AbandonedCheckoutSessionItem) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.sessionId.length > 12 ? `${row.sessionId.slice(0, 12)}...` : row.sessionId}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row: AbandonedCheckoutSessionItem) => {
        const customer = row.customerInfo || row.cartSnapshot?.customerInfo;
        return (
          <div className="space-y-0.5">
            <div className="font-semibold text-foreground text-xs">
              {customer?.name || 'Anonymous Visitor'}
            </div>
            {customer?.phone && (
              <div className="text-[11px] text-muted-foreground font-mono">
                {customer.phone}
              </div>
            )}
            {customer?.email && (
              <div className="text-[11px] text-muted-foreground">
                {customer.email}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'items',
      header: 'Items',
      render: (row: AbandonedCheckoutSessionItem) => {
        const itemCount =
          row.items?.length || row.cartSnapshot?.items?.length || 0;
        return (
          <span className="text-xs text-muted-foreground font-medium">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        );
      },
    },
    {
      key: 'checkoutValue',
      header: 'Cart Total',
      render: (row: AbandonedCheckoutSessionItem) => {
        const value = row.checkoutValue ?? row.cartSnapshot?.grandTotal ?? 0;
        return (
          <span className="font-mono text-xs font-bold text-foreground">
            <MoneyText amount={value} />
          </span>
        );
      },
    },
    {
      key: 'deviceCategory',
      header: 'Device',
      render: (row: AbandonedCheckoutSessionItem) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
          {getDeviceIcon(row.deviceCategory)}
          <span>{row.deviceCategory?.toLowerCase() || 'unknown'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: AbandonedCheckoutSessionItem) => (
        <StatusBadge
          status={CHECKOUT_STATUS_LABELS[row.status] || row.status}
          variant={CHECKOUT_STATUS_VARIANTS[row.status] || 'neutral'}
        />
      ),
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: (row: AbandonedCheckoutSessionItem) => (
        <span className="text-xs text-muted-foreground">
          <DateText date={row.lastActivityAt || row.createdAt} />
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row: AbandonedCheckoutSessionItem) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewSession(row)}
          className="h-8 gap-1.5 px-2.5 text-xs"
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Details</span>
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={total}
      page={page}
      limit={limit}
      isLoading={isLoading}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      emptyTitle="No abandoned checkouts found"
      emptyDescription="No checkout sessions match your filter criteria or have been recorded."
    />
  );
}
