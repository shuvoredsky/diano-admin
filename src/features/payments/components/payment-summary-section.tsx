'use client';

import Link from 'next/link';
import { CreditCard, ExternalLink } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import {
  PAYMENT_PROVIDER_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
} from '../constants/payments.constants';
import type { PaymentDetailEntity } from '../types/payments.types';

export interface PaymentSummarySectionProps {
  payment: PaymentDetailEntity;
}

export function PaymentSummarySection({ payment }: PaymentSummarySectionProps) {
  const orderNumber = payment.order?.orderNumber || payment.orderId.slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Top Banner / Key Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-border bg-muted/30 p-3.5">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground block">
            Payment Status
          </span>
          <div className="mt-1">
            <StatusBadge
              status={payment.status}
              label={PAYMENT_STATUS_LABELS[payment.status] || payment.status}
              variant={PAYMENT_STATUS_VARIANTS[payment.status] || 'neutral'}
              size="sm"
            />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-muted-foreground block">
            Amount Paid
          </span>
          <div className="mt-1 font-semibold text-sm text-foreground">
            <MoneyText amount={payment.amount} />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-muted-foreground block">
            Payment Provider
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{PAYMENT_PROVIDER_LABELS[payment.provider] || payment.provider}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-muted-foreground block">
            Associated Order
          </span>
          <div className="mt-1">
            <Link
              href={`/admin/orders?search=${encodeURIComponent(orderNumber)}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              #{orderNumber}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Transaction & Identifiers Grid */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Transaction Identifiers
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Payment ID:</span>
            <span className="font-mono text-foreground font-semibold break-all">
              {payment.id}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Gateway Transaction ID:</span>
            <span className="font-mono text-foreground font-semibold break-all">
              {payment.transactionId || '—'}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Bank Transaction ID:</span>
            <span className="font-mono text-foreground font-semibold break-all">
              {payment.bankTranId || '—'}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Provider Reference / Val ID:</span>
            <span className="font-mono text-foreground font-semibold break-all">
              {payment.providerReference || '—'}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Created At (Dhaka):</span>
            <div className="text-foreground">
              <DateText date={payment.createdAt} format="long" />
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Paid At:</span>
            <div className="text-foreground">
              {payment.paidAt ? (
                <DateText date={payment.paidAt} format="long" />
              ) : (
                'Unpaid / Not Recorded'
              )}
            </div>
          </div>
        </div>

        {payment.failureReason && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
            <span className="font-bold">Gateway Failure Reason:</span> {payment.failureReason}
          </div>
        )}
      </div>
    </div>
  );
}
