'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useTableQueryParams } from '@/lib/crud';
import { useRefundsQuery } from '../hooks/use-refunds-queries';
import { RefundsFilterBar } from './refunds-filter-bar';
import { RefundsTable } from './refunds-table';
import { CreateRefundModal } from './create-refund-modal';
import { RefundDetailModal } from './refund-detail-modal';
import type { RefundStatus } from '../types/refunds.types';

export function RefundsManager() {
  const { searchParams } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') as RefundStatus) || undefined;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);

  const { data: response, isLoading, refetch } = useRefundsQuery({
    orderId: search,
    status,
    page,
    limit,
  });

  const refunds = response?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refunds & Settlements"
        description="Review customer refund requests, authorize payment gateway reversals, and inspect settlement receipts."
        actions={
          <PermissionGate permission="refund:approve">
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Issue Order Refund
            </Button>
          </PermissionGate>
        }
      />

      <RefundsFilterBar />

      <RefundsTable
        refunds={refunds}
        isLoading={isLoading}
        onViewDetail={(ref) => setSelectedRefundId(ref.id)}
      />

      <CreateRefundModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      <RefundDetailModal
        refundId={selectedRefundId}
        isOpen={Boolean(selectedRefundId)}
        onClose={() => setSelectedRefundId(null)}
      />
    </div>
  );
}

