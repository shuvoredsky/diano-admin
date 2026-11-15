'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useTableQueryParams } from '@/lib/crud';
import { useCouponsQuery } from '../hooks/use-coupons-queries';
import { CouponsFilterBar } from './coupons-filter-bar';
import { CouponsTable } from './coupons-table';
import { CouponFormModal } from './coupon-form-modal';
import type { CouponEntity, CouponType } from '../types/coupons.types';

export function CouponsManager() {
  const { searchParams } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const search = searchParams.get('search') || undefined;
  const type = (searchParams.get('type') as CouponType) || undefined;
  const isActiveParam = searchParams.get('isActive');
  const isActive =
    isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponEntity | null>(null);

  const { data: response, isLoading } = useCouponsQuery({
    search,
    type,
    isActive,
    page,
    limit,
  });

  const coupons = response?.data || [];

  const handleCreate = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleEdit = (coupon: CouponEntity) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedCoupon(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons & Vouchers"
        description="Configure discount promo codes, minimum spend thresholds, and customer usage limits."
        actions={
          <PermissionGate permission="coupon:manage">
            <Button size="sm" onClick={handleCreate} className="gap-1.5 cursor-pointer">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </PermissionGate>
        }
      />

      <CouponsFilterBar />

      <CouponsTable
        coupons={coupons}
        isLoading={isLoading}
        onCreateCoupon={handleCreate}
        onEditCoupon={handleEdit}
      />

      <CouponFormModal
        isOpen={isModalOpen}
        onClose={handleClose}
        couponToEdit={selectedCoupon}
      />
    </div>
  );
}
