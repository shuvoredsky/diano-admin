'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTableQueryParams } from '@/lib/crud/use-table-query-params';
import { usePagesQuery } from '../../hooks/use-pages-queries';
import { PagesFilterBar } from './pages-filter-bar';
import { PagesTable } from './pages-table';
import { PageFormModal } from './page-form-modal';
import { PageRevisionsModal } from './page-revisions-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { PageEntity, PageType, PageStatus } from '../../types/pages.types';
import { usePermissions } from '@/hooks/use-permissions';

export function PagesManager() {
  const searchParams = useSearchParams();
  const { page, limit, setPage, setLimit, search } = useTableQueryParams({ defaultLimit: 20 });

  const [formOpen, setFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageEntity | null>(null);
  const [revisionsPage, setRevisionsPage] = useState<PageEntity | null>(null);

  const typeFilter = searchParams.get('type') || undefined;
  const statusFilter = searchParams.get('status') || undefined;

  const { data, isLoading } = usePagesQuery({
    page,
    limit,
    search: search || undefined,
    type: typeFilter ? (typeFilter as PageType) : undefined,
    status: statusFilter ? (statusFilter as PageStatus) : undefined,
  });

  const { hasPermission } = usePermissions();
  const canManage = hasPermission('page:manage');

  const pages = Array.isArray(data?.data) ? data.data : [];
  const total = Number(data?.meta?.pagination?.totalItems ?? data?.pagination?.totalItems ?? pages.length);

  const handleCreate = () => {
    setEditingPage(null);
    setFormOpen(true);
  };

  const handleEdit = (p: PageEntity) => {
    setEditingPage(p);
    setFormOpen(true);
  };

  const handleViewRevisions = (p: PageEntity) => {
    setRevisionsPage(p);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Static Pages & Legal Documentation</h2>
          <p className="text-xs text-muted-foreground">
            Author and version-control storefront content such as Privacy Policy, Terms of Service, and Brand Heritage.
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={handleCreate} className="h-8 gap-1.5 text-xs shadow-xs cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Create Page
          </Button>
        )}
      </div>

      <PagesFilterBar />

      <PagesTable
        data={pages}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        onEdit={handleEdit}
        onViewRevisions={handleViewRevisions}
      />

      <PageFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        pageToEdit={editingPage}
      />

      <PageRevisionsModal
        open={Boolean(revisionsPage)}
        onOpenChange={(isOpen) => !isOpen && setRevisionsPage(null)}
        page={revisionsPage}
      />
    </div>
  );
}
