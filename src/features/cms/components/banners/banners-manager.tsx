'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTableQueryParams } from '@/lib/crud/use-table-query-params';
import { useBannersQuery } from '../../hooks/use-banners-queries';
import { BannersFilterBar } from './banners-filter-bar';
import { BannersTable } from './banners-table';
import { BannerFormModal } from './banner-form-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { BannerEntity, BannerPlacement } from '../../types/banners.types';
import { usePermissions } from '@/hooks/use-permissions';

export function BannersManager() {
  const searchParams = useSearchParams();
  const { page, limit, setPage, setLimit } = useTableQueryParams({ defaultLimit: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerEntity | null>(null);

  const placementFilter = searchParams.get('placement') || undefined;
  const isActiveFilter = searchParams.get('isActive') ?? undefined;

  const { data, isLoading } = useBannersQuery({
    page,
    limit,
    placement: placementFilter ? (placementFilter as BannerPlacement) : undefined,
    isActive: isActiveFilter !== undefined ? isActiveFilter : undefined,
  });

  const { hasPermission } = usePermissions();
  const canManage = hasPermission('banner:manage');

  const banners = Array.isArray(data?.data) ? data.data : [];
  const total = Number(data?.meta?.pagination?.totalItems ?? data?.pagination?.totalItems ?? banners.length);

  const handleCreate = () => {
    setEditingBanner(null);
    setModalOpen(true);
  };

  const handleEdit = (banner: BannerEntity) => {
    setEditingBanner(banner);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Promotional Banners & Carousels</h2>
          <p className="text-xs text-muted-foreground">
            Manage storefront hero slides, category headers, announcement tickers, and modal popups.
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={handleCreate} className="h-8 gap-1.5 text-xs shadow-xs cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> Create Banner
          </Button>
        )}
      </div>

      <BannersFilterBar />

      <BannersTable
        data={banners}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        onEdit={handleEdit}
      />

      <BannerFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        bannerToEdit={editingBanner}
      />
    </div>
  );
}
