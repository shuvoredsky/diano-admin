'use client';

import { useState } from 'react';
import { Zap, Calendar, Package, Edit, Ban, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import { PermissionGate } from '@/components/shared/permission-gate';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import {
  useCancelFlashSaleMutation,
  useDeleteFlashSaleMutation,
} from '../hooks/use-flash-sales-queries';
import type { FlashSaleEntity } from '../types/flash-sales.types';

export interface FlashSalesTableProps {
  sales: FlashSaleEntity[];
  isLoading: boolean;
  onCreateSale: () => void;
  onEditSale?: (sale: FlashSaleEntity) => void;
}

export function FlashSalesTable({
  sales,
  isLoading,
  onCreateSale,
  onEditSale,
}: FlashSalesTableProps) {
  const [cancelTarget, setCancelTarget] = useState<FlashSaleEntity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlashSaleEntity | null>(null);

  const cancelMutation = useCancelFlashSaleMutation();
  const deleteMutation = useDeleteFlashSaleMutation();

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelMutation.mutateAsync(cancelTarget.id);
      setCancelTarget(null);
    } catch {
      // Handled in mutation onError
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Handled in mutation onError
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <EmptyState
        title="No Active Flash Sales"
        description="Launch time-limited flash sale promotions with discounted prices and exclusive stock allocations."
        action={
          <PermissionGate permission="coupon:manage">
            <Button size="sm" onClick={onCreateSale} className="gap-1.5 cursor-pointer">
              <Zap className="h-4 w-4" />
              Launch Flash Sale
            </Button>
          </PermissionGate>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Campaign Title</th>
                <th className="px-4 py-3">Schedule (Dhaka)</th>
                <th className="px-4 py-3 text-center">Allocated Items</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {sales.map((sale) => {
                const now = new Date();
                const starts = new Date(sale.startsAt);
                const ends = new Date(sale.endsAt);
                const isLive = starts <= now && ends >= now && sale.isActive;
                const isUpcoming = starts > now;
                const isEnded = !sale.isActive || ends < now;

                return (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          {sale.title}
                        </span>
                        {sale.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {sale.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                        <span>
                          <DateText date={sale.startsAt} format="date" /> -{' '}
                          <DateText date={sale.endsAt} format="date" />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        {sale.items?.length || 0} {sale.items?.length === 1 ? 'Variant' : 'Variants'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={
                          !sale.isActive
                            ? 'CANCELLED'
                            : isLive
                            ? 'ACTIVE'
                            : isUpcoming
                            ? 'SCHEDULED'
                            : 'EXPIRED'
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <PermissionGate permission="coupon:manage">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditSale?.(sale)}
                            className="h-7 px-2 text-xs gap-1 cursor-pointer"
                            aria-label={`Edit ${sale.title}`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Button>

                          {/* Rule: delete only when startsAt is in the future; hide delete once started, show Cancel instead */}
                          {isUpcoming ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(sale)}
                              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 gap-1 cursor-pointer"
                              aria-label={`Delete ${sale.title}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </Button>
                          ) : !isEnded && sale.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCancelTarget(sale)}
                              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 gap-1 cursor-pointer"
                              aria-label={`Cancel ${sale.title}`}
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span>Cancel</span>
                            </Button>
                          ) : null}
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item allocation preview for first active sale */}
      {sales[0]?.items && sales[0].items.length > 0 && (
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Product Variant Allocations — &quot;{sales[0].title}&quot;</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {sales[0].items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-2.5 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-mono text-[11px] font-semibold text-foreground block">
                    {item.variantId}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Limit: {item.stockLimit} units | Sold: {item.soldCount}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-primary">
                    <MoneyText amount={item.discountPrice} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel Flash Sale Campaign"
        description={`Are you sure you want to cancel "${cancelTarget?.title}"? This campaign has already started. Cancelling will deactivate discount pricing immediately across customer channels.`}
        confirmLabel="Cancel Campaign"
        variant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
      />

      {/* Delete Confirmation Dialog (Future campaigns only) */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Scheduled Flash Sale"
        description={`Are you sure you want to permanently delete the upcoming campaign "${deleteTarget?.title}"? This campaign has not started yet and will be completely removed.`}
        confirmLabel="Delete Campaign"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
