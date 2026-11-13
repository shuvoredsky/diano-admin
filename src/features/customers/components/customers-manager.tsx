'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTableQueryParams } from '@/lib/crud';
import { useCustomersQuery } from '../hooks/use-customers-queries';
import { CustomersFilterBar } from './customers-filter-bar';
import { CustomersTable } from './customers-table';
import { CustomerDetailModal } from './customer-detail-modal';
import type { CustomerListItem, CustomerStatus } from '../types/customers.types';

export function CustomersManager() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

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

  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') as CustomerStatus) || undefined;

  const { data: response, isLoading } = useCustomersQuery({
    page,
    limit,
    search,
    status,
  });

  const items = response?.data || [];
  const total = response?.meta?.pagination?.totalItems ?? response?.pagination?.totalItems ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Customer directory, account status, communication preferences, and lifetime order histories."
      />

      <CustomersFilterBar />

      <CustomersTable
        data={items}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onViewCustomer={(customer: CustomerListItem) => {
          setSelectedCustomerId(customer.id);
        }}
      />

      <CustomerDetailModal
        customerId={selectedCustomerId}
        isOpen={Boolean(selectedCustomerId)}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
}
