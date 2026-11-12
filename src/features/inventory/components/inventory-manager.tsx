'use client';

import { useState } from 'react';
import { Package, AlertTriangle, History } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorState } from '@/components/feedback/error-state';
import { useTableQueryParams } from '@/lib/crud';
import {
  useInventoryListQuery,
  useInventorySummaryQuery,
  useLowStockQuery,
  useStockMovementsQuery,
} from '../hooks/use-inventory-queries';
import type { StockMovementType } from '../types/inventory.types';
import { InventorySummaryCards } from './inventory-summary-cards';
import { StockFilterBar } from './stock-filter-bar';
import { StockTable } from './stock-table';
import { StockMovementsTable } from './stock-movements-table';

type TabType = 'overview' | 'low-stock' | 'movements';

export function InventoryManager() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const { page, limit, searchParams, setPage, setLimit } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const {
    data: summary,
    isLoading: isSummaryLoading,
  } = useInventorySummaryQuery();

  // Stock overview query
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,
  } = useInventoryListQuery({
    page,
    limit,
    search: searchParams.get('search') || undefined,
    lowStockOnly: searchParams.get('lowStockOnly') === 'true' || undefined,
    outOfStockOnly: searchParams.get('outOfStockOnly') === 'true' || undefined,
  });

  // Low stock query
  const {
    data: lowStockData,
    isLoading: isLowStockLoading,
    error: lowStockError,
    refetch: refetchLowStock,
  } = useLowStockQuery({ page, limit });

  // Ledger query
  const {
    data: movementsData,
    isLoading: isMovementsLoading,
    error: movementsError,
    refetch: refetchMovements,
  } = useStockMovementsQuery({
    page,
    limit,
    type: (searchParams.get('type') as StockMovementType) || undefined,
  });

  const items = inventoryData?.data || [];
  const inventoryTotal = inventoryData?.meta?.pagination?.totalItems ?? items.length;

  const lowStockItems = lowStockData?.data || [];
  const lowStockTotal = lowStockData?.meta?.pagination?.totalItems ?? lowStockItems.length;

  const movements = movementsData?.data || [];
  const movementsTotal = movementsData?.meta?.pagination?.totalItems ?? movements.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Monitor multi-warehouse stock levels, reorder thresholds, and immutable ledger movements"
      />

      <InventorySummaryCards summary={summary} isLoading={isSummaryLoading} />

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary shadow-2xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Stock Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('low-stock')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'low-stock'
              ? 'bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary shadow-2xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Low Stock Alerts ({lowStockTotal})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'movements'
              ? 'bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary shadow-2xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Stock Ledger (Audit Trail)</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <StockFilterBar />
          {inventoryError ? (
            <ErrorState
              title="Failed to load inventory"
              message={inventoryError instanceof Error ? inventoryError.message : 'Error fetching inventory'}
              onRetry={() => refetchInventory()}
            />
          ) : (
            <StockTable
              data={items}
              total={inventoryTotal}
              page={page}
              limit={limit}
              isLoading={isInventoryLoading}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </div>
      )}

      {activeTab === 'low-stock' && (
        <div className="space-y-4">
          {lowStockError ? (
            <ErrorState
              title="Failed to load low stock items"
              message={lowStockError instanceof Error ? lowStockError.message : 'Error fetching low stock'}
              onRetry={() => refetchLowStock()}
            />
          ) : (
            <StockTable
              data={lowStockItems}
              total={lowStockTotal}
              page={page}
              limit={limit}
              isLoading={isLowStockLoading}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="space-y-4">
          {movementsError ? (
            <ErrorState
              title="Failed to load stock movements"
              message={movementsError instanceof Error ? movementsError.message : 'Error fetching stock ledger'}
              onRetry={() => refetchMovements()}
            />
          ) : (
            <StockMovementsTable
              data={movements}
              total={movementsTotal}
              page={page}
              limit={limit}
              isLoading={isMovementsLoading}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </div>
      )}
    </div>
  );
}

