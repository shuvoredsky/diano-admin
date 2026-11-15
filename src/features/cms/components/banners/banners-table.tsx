'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { DateText } from '@/components/shared/date-text';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ImageOff } from 'lucide-react';
import type { BannerEntity } from '../../types/banners.types';
import { PLACEMENT_COLOR_MAP } from '../../constants/banners.constants';
import { useToggleBannerMutation, useDeleteBannerMutation } from '../../hooks/use-banners-queries';
import { usePermissions } from '@/hooks/use-permissions';

interface BannersTableProps {
  data: BannerEntity[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  onEdit: (banner: BannerEntity) => void;
}

export function BannersTable({
  data,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  onEdit,
}: BannersTableProps) {
  const [bannerToDelete, setBannerToDelete] = useState<BannerEntity | null>(null);
  const toggleMutation = useToggleBannerMutation();
  const deleteMutation = useDeleteBannerMutation();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('banner:manage');

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    try {
      await deleteMutation.mutateAsync(bannerToDelete.id);
      setBannerToDelete(null);
    } catch {
      // Errors handled via mutation error
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 w-full rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
        <EmptyState
          title="No banners found"
          description="Create your first promotional carousel or placement banner above."
        />
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Banner Details</th>
                <th className="px-4 py-3">Placement</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Schedule (Dhaka)</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((banner) => {
                const isCloudinary = banner.desktopImage && banner.desktopImage.startsWith('https://res.cloudinary.com/');
                const placementColor = PLACEMENT_COLOR_MAP[banner.placement] || 'bg-muted text-foreground';

                return (
                  <tr key={banner.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="h-10 w-16 relative rounded-md overflow-hidden bg-muted border border-border/60 flex items-center justify-center shrink-0">
                        {isCloudinary ? (
                          <Image
                            src={banner.desktopImage}
                            alt={banner.altText || banner.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground text-xs">{banner.title}</p>
                        {banner.subtitle && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{banner.subtitle}</p>
                        )}
                        {banner.linkUrl && (
                          <p className="text-[10px] text-primary/80 font-mono line-clamp-1">{banner.linkUrl}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-medium border ${placementColor}`}>
                        {banner.placement.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        disabled={!canManage || toggleMutation.isPending}
                        onClick={() => toggleMutation.mutate(banner.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                          banner.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        } ${!canManage ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${banner.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {!banner.startsAt && !banner.endsAt ? (
                        <span className="text-[11px]">Always active</span>
                      ) : (
                        <div className="space-y-0.5 text-[10px]">
                          {banner.startsAt && <div>From: <DateText date={banner.startsAt} format="short" /></div>}
                          {banner.endsAt && <div>Until: <DateText date={banner.endsAt} format="short" /></div>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                      #{banner.sortOrder}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {canManage && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(banner)}
                            title="Edit banner"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setBannerToDelete(banner)}
                            title="Delete banner"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{data.length}</strong> of{' '}
            <strong className="text-foreground">{total}</strong> banners
          </span>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Items per page"
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 text-xs cursor-pointer"
            >
              Previous
            </Button>
            <span className="px-1 text-xs">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-8 text-xs cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(bannerToDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setBannerToDelete(null);
        }}
        title="Delete Promotional Banner"
        description={`Are you sure you want to permanently delete "${bannerToDelete?.title}"? This banner will immediately be removed from the storefront.`}
        confirmLabel="Delete Banner"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
