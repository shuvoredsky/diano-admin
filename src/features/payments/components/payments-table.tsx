'use client';

import Link from 'next/link';
import { Eye, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import {
  PAYMENT_PROVIDER_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
} from '../constants/payments.constants';
import type { PaymentListItem } from '../types/payments.types';

export function maskTransactionId(txId: string | null | undefined): string {
  if (!txId) return '—';
  if (txId.length <= 8) return txId;
  const start = txId.slice(0, 4);
  const end = txId.slice(-4);
  return `${start}••••${end}`;
}

export interface PaymentsTableProps {
  data: PaymentListItem[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewPayment: (payment: PaymentListItem) => void;
}

export function PaymentsTable({
  data,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
  onViewPayment,
}: PaymentsTableProps) {
  const columns: ColumnDef<PaymentListItem>[] = [
    {
      key: 'id',
      header: 'Payment / Date',
      render: (row: PaymentListItem) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-xs text-foreground block font-mono">
            {row.id.slice(0, 8)}...
          </span>
          <div className="text-[11px] text-muted-foreground">
            <DateText date={row.createdAt} format="short" />
          </div>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      render: (row: PaymentListItem) => {
        const orderNumber = row.order?.orderNumber || row.orderId.slice(0, 8);
        return (
          <div className="space-y-0.5">
            <Link
              href={`/admin/orders?search=${encodeURIComponent(orderNumber)}`}
              className="text-xs font-semibold text-primary hover:underline block"
            >
              #{orderNumber}
            </Link>
            {row.order?.status && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Order: {row.order.status}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'provider',
      header: 'Provider',
      render: (row: PaymentListItem) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{PAYMENT_PROVIDER_LABELS[row.provider] || row.provider}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row: PaymentListItem) => (
        <div className="space-y-0.5">
          <MoneyText
            amount={row.amount}
            className="font-semibold text-xs text-foreground"
          />
          {row.paymentFee ? (
            <span className="text-[10px] text-muted-foreground block">
              Fee: <MoneyText amount={row.paymentFee} />
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: PaymentListItem) => (
        <StatusBadge
          status={row.status}
          label={PAYMENT_STATUS_LABELS[row.status] || row.status}
          variant={PAYMENT_STATUS_VARIANTS[row.status] || 'neutral'}
          size="sm"
        />
      ),
    },
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (row: PaymentListItem) => (
        <span
          className="font-mono text-xs text-muted-foreground"
          title={row.transactionId || undefined}
        >
          {maskTransactionId(row.transactionId)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row: PaymentListItem) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewPayment(row)}
          className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          View
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
      emptyTitle="No payments found"
      emptyDescription="No payment transactions match your query."
    />
  );
}
