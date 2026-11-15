'use client';

import { useState } from 'react';
import { Tag, Edit2, Trash2, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import { PermissionGate } from '@/components/shared/permission-gate';
import { EmptyState } from '@/components/feedback/empty-state';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { useDeleteCouponMutation } from '../hooks/use-coupons-queries';
import { COUPON_TYPE_LABELS } from '../constants/coupons.constants';
import type { CouponEntity } from '../types/coupons.types';

export interface CouponsTableProps {
  coupons: CouponEntity[];
  isLoading: boolean;
  onEditCoupon: (coupon: CouponEntity) => void;
  onCreateCoupon: () => void;
}

export function CouponsTable({
  coupons,
  isLoading,
  onEditCoupon,
  onCreateCoupon,
}: CouponsTableProps) {
  const [couponToDelete, setCouponToDelete] = useState<CouponEntity | null>(null);
  const deleteMutation = useDeleteCouponMutation();

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;
    try {
      await deleteMutation.mutateAsync(couponToDelete.id);
      setCouponToDelete(null);
    } catch {
      // Handled by mutation toast
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <EmptyState
        title="No Promotional Coupons Found"
        description="Create promotional discount vouchers, percentage off deals, or free shipping codes for your store."
        action={
          <PermissionGate permission="coupon:manage">
            <Button size="sm" onClick={onCreateCoupon} className="gap-1.5 cursor-pointer">
              <Tag className="h-4 w-4" />
              Create First Coupon
            </Button>
          </PermissionGate>
        }
      />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Code / Type</th>
              <th className="px-4 py-3">Discount Value</th>
              <th className="px-4 py-3">Min Order / Cap</th>
              <th className="px-4 py-3">Schedule (Dhaka)</th>
              <th className="px-4 py-3 text-center">Usage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {coupons.map((coupon) => {
              const isExpired = new Date(coupon.expiresAt) < new Date();
              return (
                <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-xs text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md inline-block">
                        {coupon.code}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {COUPON_TYPE_LABELS[coupon.type]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {coupon.type === 'PERCENTAGE' && <span>{coupon.value}% OFF</span>}
                    {coupon.type === 'FIXED' && (
                      <span className="flex items-center gap-1">
                        <MoneyText amount={coupon.value} /> <span>OFF</span>
                      </span>
                    )}
                    {coupon.type === 'FREE_SHIPPING' && (
                      <span className="text-primary font-medium">Free Delivery</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="space-y-0.5">
                      <div>
                        Min: <MoneyText amount={coupon.minPurchase} />
                      </div>
                      {coupon.maxDiscount && (
                        <div className="text-[11px]">
                          Max: <MoneyText amount={coupon.maxDiscount} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3 w-3 text-muted-foreground/60" />
                        <DateText date={coupon.startsAt} format="date" /> -{' '}
                        <DateText date={coupon.expiresAt} format="date" />
                      </div>
                      {isExpired && (
                        <span className="inline-block rounded bg-destructive/10 px-1.5 py-0.2 text-[10px] font-semibold text-destructive">
                          Expired
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-mono text-xs">
                      <Users className="h-3 w-3 text-muted-foreground/60" />
                      {coupon.usedCount} / {coupon.usageLimit ?? '∞'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={coupon.isActive && !isExpired ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PermissionGate permission="coupon:manage">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditCoupon(coupon)}
                          className="h-7 w-7 p-0 cursor-pointer"
                          title="Edit coupon"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCouponToDelete(coupon)}
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Delete coupon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </PermissionGate>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(couponToDelete)}
        onOpenChange={(open) => !open && setCouponToDelete(null)}
        title={`Delete Coupon "${couponToDelete?.code}"?`}
        description="Are you sure you want to deactivate and remove this coupon? Any checkout sessions using this code will no longer receive discounts."
        variant="destructive"
        confirmLabel="Delete Coupon"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

