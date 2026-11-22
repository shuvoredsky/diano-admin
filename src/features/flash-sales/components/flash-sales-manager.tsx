'use client';

import { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useActiveFlashSalesQuery } from '../hooks/use-flash-sales-queries';
import { FlashSalesTable } from './flash-sales-table';
import { CreateFlashSaleModal } from './create-flash-sale-modal';
import { EditFlashSaleModal } from './edit-flash-sale-modal';
import type { FlashSaleEntity } from '../types/flash-sales.types';

export function FlashSalesManager() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSaleEntity | null>(null);
  const { data: sales = [], isLoading } = useActiveFlashSalesQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flash Sales & Lightning Deals"
        description="Launch and manage time-gated promotional campaigns with steep discounts and strict stock limits."
        actions={
          <PermissionGate permission="coupon:manage">
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Launch Flash Sale
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground">
        <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Promotional Campaign Management
          </p>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Flash sales apply time-gated price overrides across storefront channels according to Asia/Dhaka schedule. Ongoing campaigns can be cancelled immediately; scheduled future campaigns can be updated or deleted before start.
          </p>
        </div>
      </div>

      <FlashSalesTable
        sales={sales}
        isLoading={isLoading}
        onCreateSale={() => setIsCreateModalOpen(true)}
        onEditSale={(sale) => setEditingSale(sale)}
      />

      <CreateFlashSaleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditFlashSaleModal
        sale={editingSale}
        isOpen={editingSale !== null}
        onClose={() => setEditingSale(null)}
      />
    </div>
  );
}
