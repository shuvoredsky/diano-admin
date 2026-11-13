'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTableQueryParams } from '@/lib/crud';
import { useAbandonedCheckoutsQuery } from '../hooks/use-abandoned-queries';
import { AbandonedFilterBar } from './abandoned-filter-bar';
import { AbandonedTable } from './abandoned-table';
import { AbandonedDetailModal } from './abandoned-detail-modal';
import type { AbandonedCheckoutSessionItem, CheckoutStatus } from '../types/abandoned.types';

export function AbandonedManager() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const {
    page,
    limit,
    searchParams,
    setPage,
    setLimit,
  } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const status = (searchParams.get('status') as CheckoutStatus) || undefined;
  const fromDate = searchParams.get('fromDate') || undefined;
  const toDate = searchParams.get('toDate') || undefined;

  const { data: response, isLoading } = useAbandonedCheckoutsQuery({
    page,
    limit,
    status,
    fromDate,
    toDate,
  });

  const items = response?.data || [];
  const total = response?.meta?.pagination?.totalItems ?? response?.pagination?.totalItems ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abandoned Checkouts"
        description="Monitor incomplete checkout sessions, analyze abandonment patterns, and initiate customer recovery campaigns."
      />

      <AbandonedFilterBar />

      <AbandonedTable
        data={items}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onViewSession={(session: AbandonedCheckoutSessionItem) => {
          setSelectedSessionId(session.id || session.sessionId);
        }}
      />

      <AbandonedDetailModal
        sessionId={selectedSessionId}
        isOpen={Boolean(selectedSessionId)}
        onClose={() => setSelectedSessionId(null)}
      />
    </div>
  );
}
