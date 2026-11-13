'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTableQueryParams } from '@/lib/crud';
import { usePaymentsQuery } from '../hooks/use-payments-queries';
import { PaymentsFilterBar } from './payments-filter-bar';
import { PaymentsTable } from './payments-table';
import { PaymentDetailModal } from './payment-detail-modal';
import type {
  PaymentListItem,
  PaymentProvider,
  PaymentStatus,
} from '../types/payments.types';

export function PaymentsManager() {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

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

  const orderId = searchParams.get('orderId') || undefined;
  const provider = (searchParams.get('provider') as PaymentProvider) || undefined;
  const status = (searchParams.get('status') as PaymentStatus) || undefined;

  const { data: response, isLoading } = usePaymentsQuery({
    page,
    limit,
    orderId,
    provider,
    status,
  });

  const items = response?.data || [];
  const total =
    response?.meta?.pagination?.totalItems ??
    response?.pagination?.totalItems ??
    0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Monitor SSLCOMMERZ gateway transactions, COD courier cash receipts, and settlement lifecycles."
      />

      <PaymentsFilterBar />

      <PaymentsTable
        data={items}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onViewPayment={(payment: PaymentListItem) => {
          setSelectedPaymentId(payment.id);
        }}
      />

      <PaymentDetailModal
        paymentId={selectedPaymentId}
        isOpen={Boolean(selectedPaymentId)}
        onClose={() => setSelectedPaymentId(null)}
      />
    </div>
  );
}
