'use client';

import Link from 'next/link';
import { ExternalLink, ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import {
  FRAUD_RISK_LABELS,
  FRAUD_RISK_VARIANTS,
  FRAUD_REVIEW_STATUS_LABELS,
  FRAUD_REVIEW_STATUS_VARIANTS,
} from '../constants/fraud.constants';
import type { FraudReviewDetailEntity } from '../types/fraud.types';

export interface FraudReviewSummarySectionProps {
  review: FraudReviewDetailEntity;
}

export function FraudReviewSummarySection({ review }: FraudReviewSummarySectionProps) {
  const order = review.order;
  const orderNumber = order?.orderNumber || review.orderId.slice(0, 8);

  const customerSnapshot = order?.customerSnapshot as Record<string, unknown> | null;
  const shippingAddress = order?.shippingAddressSnapshot as Record<string, unknown> | null;

  return (
    <div className="space-y-4">
      {/* Top Banner / Key Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-border bg-muted/30 p-3.5">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground block">
            Risk Tier
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            {review.riskLevel === 'HIGH' ? (
              <ShieldAlert className="h-4 w-4 text-destructive" />
            ) : review.riskLevel === 'MEDIUM' ? (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            )}
            <StatusBadge
              status={review.riskLevel}
              label={FRAUD_RISK_LABELS[review.riskLevel] || review.riskLevel}
              variant={FRAUD_RISK_VARIANTS[review.riskLevel] || 'neutral'}
              size="sm"
            />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-muted-foreground block">
            Risk Score
          </span>
          <div className="mt-1 font-mono font-bold text-sm text-foreground">
            {review.riskScore} / 100
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-muted-foreground block">
            Review Status
          </span>
          <div className="mt-1">
            <StatusBadge
              status={review.reviewStatus}
              label={FRAUD_REVIEW_STATUS_LABELS[review.reviewStatus] || review.reviewStatus}
              variant={FRAUD_REVIEW_STATUS_VARIANTS[review.reviewStatus] || 'neutral'}
              size="sm"
            />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-medium text-muted-foreground block">
            Target Order
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

      {/* Order & Customer Snapshot */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Order & Context Facts
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Grand Total:</span>
            <div className="font-semibold text-foreground">
              {order?.grandTotal ? <MoneyText amount={order.grandTotal} /> : '—'}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Payment Method:</span>
            <span className="text-foreground uppercase font-semibold">
              {order?.paymentMethod || 'UNKNOWN'}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Customer Contact:</span>
            <span className="text-foreground">
              {String(customerSnapshot?.phone || customerSnapshot?.email || 'N/A')}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Shipping Destination:</span>
            <span className="text-foreground">
              {String(shippingAddress?.district || shippingAddress?.area || shippingAddress?.address || 'N/A')}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Assessment Date (Dhaka):</span>
            <div className="text-foreground">
              <DateText date={review.createdAt} format="long" />
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Order Status:</span>
            <span className="text-foreground font-semibold">
              {order?.status || 'UNKNOWN'}
            </span>
          </div>
        </div>

        {review.explanation && (
          <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Engine Explanation:</span>{' '}
            {review.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
