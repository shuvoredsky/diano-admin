'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { FilterBar } from '@/components/tables/filter-bar';
import { ErrorState } from '@/components/feedback/error-state';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useTableQueryParams } from '@/lib/crud';
import { useSuppliersQuery } from '../hooks/use-suppliers-queries';
import { SuppliersTable } from './suppliers-table';
import { SupplierFormModal } from './supplier-form-modal';

export function SuppliersManager() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { page, limit, searchParams, setPage, setLimit } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const search = searchParams.get('search') || undefined;
  const isActiveParam = searchParams.get('isActive');
  const isActive = isActiveParam ? isActiveParam === 'true' : undefined;

  const { data, isLoading, error, refetch } = useSuppliersQuery({
    page,
    limit,
    search,
    isActive,
  });

  const suppliers = data?.data || [];
  const total = data?.meta?.pagination?.totalItems ?? suppliers.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage vendors, manufacturing partners, and contact directories"
        actions={
          <PermissionGate permissions={['supplier:manage']}>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Supplier</span>
            </Button>
          </PermissionGate>
        }
      />

      <FilterBar
        searchPlaceholder="Search suppliers by name, code, contact or email..."
        searchParamKey="search"
      />

      {error ? (
        <ErrorState
          title="Failed to load suppliers"
          message={error instanceof Error ? error.message : 'Error fetching suppliers directory'}
          onRetry={() => refetch()}
        />
      ) : (
        <SuppliersTable
          data={suppliers}
          total={total}
          page={page}
          limit={limit}
          isLoading={isLoading}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      {isCreateModalOpen && (
        <SupplierFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}

