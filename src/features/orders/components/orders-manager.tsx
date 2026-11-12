'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorState } from '@/components/feedback/error-state';
import { useTableQueryParams } from '@/lib/crud';
import { useAdminOrdersQuery } from '../hooks/use-orders-queries';
import { OrdersFilterBar } from './orders-filter-bar';
import { OrdersTable } from './orders-table';
import { OrderDetailModal } from './order-detail-modal';
import type { OrderStatus, PaymentStatus } from '../types/orders.types';

export function OrdersManager() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { page, limit, searchParams, setPage, setLimit } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') as OrderStatus) || undefined;
  const paymentStatus = (searchParams.get('paymentStatus') as PaymentStatus) || undefined;

  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch,
  } = useAdminOrdersQuery({
    page,
    limit,
    search,
    status,
    paymentStatus,
  });

  const orders = ordersResponse?.data || [];
  const total = ordersResponse?.meta?.pagination?.totalItems ?? orders.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Monitor multi-channel order fulfillment, state transitions, customer notes, and invoicing"
      />

      <OrdersFilterBar />

      {error ? (
        <ErrorState
          title="Failed to load orders"
          message={error instanceof Error ? error.message : 'Error fetching orders'}
          onRetry={() => refetch()}
        />
      ) : (
        <OrdersTable
          data={orders}
          total={total}
          page={page}
          limit={limit}
          isLoading={isLoading}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onViewOrder={(order) => setSelectedOrderId(order.id)}
        />
      )}

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          isOpen={Boolean(selectedOrderId)}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
