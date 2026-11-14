'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTableQueryParams } from '@/lib/crud';
import { useReturnsQuery } from '../hooks/use-returns-queries';
import { ReturnsFilterBar } from './returns-filter-bar';
import { ReturnsTable } from './returns-table';
import { ReturnDetailModal } from './return-detail-modal';
import type { ReturnStatus } from '../types/returns.types';

export function ReturnsManager() {
  const { searchParams } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') as ReturnStatus) || undefined;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);

  const { data: response, isLoading, refetch } = useReturnsQuery({
    orderId: search,
    status,
    page,
    limit,
  });

  const returns = response?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns & RMA"
        description="Inspect inbound return shipments, verify physical conditions, and authorize customer refunds or replacements."
      />

      <ReturnsFilterBar />

      <ReturnsTable
        returns={returns}
        isLoading={isLoading}
        onViewDetail={(ret) => setSelectedReturnId(ret.id)}
      />

      <ReturnDetailModal
        returnId={selectedReturnId}
        isOpen={Boolean(selectedReturnId)}
        onClose={() => setSelectedReturnId(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

