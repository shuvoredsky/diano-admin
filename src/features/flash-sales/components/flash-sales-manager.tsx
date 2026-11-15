'use client';

import { useState } from 'react';
import { Plus, Info } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useActiveFlashSalesQuery } from '../hooks/use-flash-sales-queries';
import { FlashSalesTable } from './flash-sales-table';
import { CreateFlashSaleModal } from './create-flash-sale-modal';

export function FlashSalesManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: sales = [], isLoading } = useActiveFlashSalesQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flash Sales & Lightning Deals"
        description="Launch time-gated promotional campaigns with steep discounts and strict stock limits."
        actions={
          <PermissionGate permission="coupon:manage">
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Launch Flash Sale
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Backend API Contract Notice (BG-06)
          </p>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Flash sales created here are active across customer storefront channels and terminate automatically at their scheduled expiration. Per backend specification (BG-06), update and delete endpoints are not implemented in the backend API.
          </p>
        </div>
      </div>

      <FlashSalesTable
        sales={sales}
        isLoading={isLoading}
        onCreateSale={() => setIsModalOpen(true)}
      />

      <CreateFlashSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
