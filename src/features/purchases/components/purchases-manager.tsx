'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { FilterBar } from '@/components/tables/filter-bar';
import { ErrorState } from '@/components/feedback/error-state';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useTableQueryParams } from '@/lib/crud';
import { usePurchaseOrdersQuery } from '../hooks/use-purchases-queries';
import type { PurchaseOrderStatus } from '../types/purchases.types';
import { PurchaseOrdersTable } from './purchase-orders-table';
import { PurchaseOrderFormModal } from './purchase-order-form-modal';

export function PurchasesManager() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { page, limit, searchParams, setPage, setLimit } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const currentStatus = (searchParams.get('status') as PurchaseOrderStatus) || undefined;

  const { data, isLoading, error, refetch } = usePurchaseOrdersQuery({
    page,
    limit,
    status: currentStatus,
  });

  const purchaseOrders = data?.data || [];
  const total = data?.meta?.pagination?.totalItems ?? purchaseOrders.length;

  const handleStatusFilter = (val: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (val) {
      params.set('status', val);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    window.history.replaceState(null, '', `?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Procure stock from suppliers, manage procurement lifecycles, and receive inbound inventory"
        actions={
          <PermissionGate permissions={['supplier:manage']}>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Purchase Order</span>
            </Button>
          </PermissionGate>
        }
      />

      <FilterBar showClear={false}>
        <div className="flex items-center gap-2">
          <select
            value={currentStatus || ''}
            onChange={e => handleStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ORDERED">Ordered</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </FilterBar>

      {error ? (
        <ErrorState
          title="Failed to load purchase orders"
          message={error instanceof Error ? error.message : 'Error fetching purchase orders'}
          onRetry={() => refetch()}
        />
      ) : (
        <PurchaseOrdersTable
          data={purchaseOrders}
          total={total}
          page={page}
          limit={limit}
          isLoading={isLoading}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      {isCreateModalOpen && (
        <PurchaseOrderFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}

