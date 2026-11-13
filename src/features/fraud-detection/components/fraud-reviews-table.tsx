'use client';

import Link from 'next/link';
import { Eye, ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { MoneyText } from '@/components/shared/money-text';
import {
  FRAUD_RISK_LABELS,
  FRAUD_RISK_VARIANTS,
  FRAUD_REVIEW_STATUS_LABELS,
  FRAUD_REVIEW_STATUS_VARIANTS,
} from '../constants/fraud.constants';
import type { FraudReviewListItem } from '../types/fraud.types';

export interface FraudReviewsTableProps {
  data: FraudReviewListItem[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewReview: (review: FraudReviewListItem) => void;
}

export function FraudReviewsTable({
  data,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
  onViewReview,
}: FraudReviewsTableProps) {
  const columns: ColumnDef<FraudReviewListItem>[] = [
    {
      key: 'order',
      header: 'Order / Placed',
      render: (row: FraudReviewListItem) => {
        const orderNumber = row.order?.orderNumber || row.orderId.slice(0, 8);
        return (
          <div className="space-y-0.5">
            <Link
              href={`/admin/orders?search=${encodeURIComponent(orderNumber)}`}
              className="text-xs font-semibold text-primary hover:underline block"
            >
              #{orderNumber}
            </Link>
            <div className="text-[11px] text-muted-foreground">
              <DateText date={row.createdAt} format="short" />
            </div>
          </div>
        );
      },
    },
    {
      key: 'amount',
      header: 'Order Total',
      render: (row: FraudReviewListItem) => (
        <div className="space-y-0.5">
          {row.order?.grandTotal ? (
            <MoneyText
              amount={row.order.grandTotal}
              className="font-semibold text-xs text-foreground"
            />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
          {row.order?.paymentMethod && (
            <span className="text-[10px] text-muted-foreground block uppercase">
              {row.order.paymentMethod}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      render: (row: FraudReviewListItem) => {
        const Icon =
          row.riskLevel === 'HIGH'
            ? ShieldAlert
            : row.riskLevel === 'MEDIUM'
              ? AlertTriangle
              : ShieldCheck;

        return (
          <div className="flex items-center gap-1.5">
            <Icon
              className={`h-4 w-4 ${
                row.riskLevel === 'HIGH'
                  ? 'text-destructive'
                  : row.riskLevel === 'MEDIUM'
                    ? 'text-amber-500'
                    : 'text-emerald-600'
              }`}
            />
            <StatusBadge
              status={row.riskLevel}
              label={FRAUD_RISK_LABELS[row.riskLevel] || row.riskLevel}
              variant={FRAUD_RISK_VARIANTS[row.riskLevel] || 'neutral'}
              size="sm"
            />
          </div>
        );
      },
    },
    {
      key: 'riskScore',
      header: 'Score',
      render: (row: FraudReviewListItem) => (
        <span
          className={`font-mono text-xs font-bold ${
            row.riskScore >= 70
              ? 'text-destructive'
              : row.riskScore >= 40
                ? 'text-amber-500'
                : 'text-emerald-600'
          }`}
        >
          {row.riskScore}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Review Status',
      render: (row: FraudReviewListItem) => (
        <StatusBadge
          status={row.reviewStatus}
          label={FRAUD_REVIEW_STATUS_LABELS[row.reviewStatus] || row.reviewStatus}
          variant={FRAUD_REVIEW_STATUS_VARIANTS[row.reviewStatus] || 'neutral'}
          size="sm"
        />
      ),
    },
    {
      key: 'rules',
      header: 'Triggered Rules',
      render: (row: FraudReviewListItem) => {
        const rules = row.triggeredRules || [];
        if (rules.length === 0) {
          return <span className="text-xs text-muted-foreground">None</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {rules.slice(0, 2).map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                title={`${r.name}: ${r.reason}`}
              >
                {r.name}
              </span>
            ))}
            {rules.length > 2 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{rules.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row: FraudReviewListItem) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewReview(row)}
          className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          Review
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
      emptyTitle="No fraud reviews found"
      emptyDescription="No orders currently match your fraud filter criteria."
    />
  );
}
