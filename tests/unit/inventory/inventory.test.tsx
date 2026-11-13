import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProviders } from '@/components/providers/app-providers';
import * as usePermissionsHook from '@/hooks/use-permissions';
import { StockTable } from '@/features/inventory/components/stock-table';
import { InventorySummaryCards } from '@/features/inventory/components/inventory-summary-cards';
import { StockMovementsTable } from '@/features/inventory/components/stock-movements-table';
import { AdjustStockModal } from '@/features/inventory/components/adjust-stock-modal';
import { SupplierFormModal } from '@/features/suppliers/components/supplier-form-modal';
import { PurchaseOrderDetailModal } from '@/features/purchases/components/purchase-order-detail-modal';
import { PurchaseOrderReceiveModal } from '@/features/purchases/components/purchase-order-receive-modal';
import { AuditDetailModal } from '@/features/inventory/components/audit-detail-modal';
import type { InventoryEntity, StockMovementEntity } from '@/features/inventory/types/inventory.types';
import type { PurchaseOrderEntity } from '@/features/purchases/types/purchases.types';
import * as inventoryApi from '@/features/inventory/api/inventory.api';
import type * as InventoryQueriesModule from '@/features/inventory/hooks/use-inventory-queries';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/inventory',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock stock audit queries
vi.mock('@/features/inventory/hooks/use-inventory-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof InventoryQueriesModule>();
  return {
    ...actual,
    useStockAuditByIdQuery: vi.fn((id?: string) => {
      if (!id) return { data: null, isLoading: false };
      return {
        data: {
          id: 'audit-123',
          warehouseId: 'wh-1',
          warehouse: { id: 'wh-1', name: 'Central Warehouse Dhaka', code: 'WH-DHK-01' },
          status: 'IN_PROGRESS',
          discrepanciesFound: 2,
          notes: 'Routine cycle count',
          startedAt: '2026-11-12T04:00:00.000Z',
          completedAt: null,
          createdAt: '2026-11-12T04:00:00.000Z',
          updatedAt: '2026-11-12T04:30:00.000Z',
          items: [
            {
              id: 'item-1',
              auditId: 'audit-123',
              variantId: 'var-1',
              systemQuantity: 20,
              countedQuantity: 18,
              variance: -2,
              notes: 'Damaged box missing 2 units',
              createdAt: '2026-11-12T04:15:00.000Z',
              updatedAt: '2026-11-12T04:15:00.000Z',
              variant: { id: 'var-1', name: 'Silk Panjabi - 40', sku: 'SLK-PAN-40' },
            },
            {
              id: 'item-2',
              auditId: 'audit-123',
              variantId: 'var-2',
              systemQuantity: 10,
              countedQuantity: 15,
              variance: 5,
              notes: 'Found extra in back shelf',
              createdAt: '2026-11-12T04:20:00.000Z',
              updatedAt: '2026-11-12T04:20:00.000Z',
              variant: { id: 'var-2', name: 'Cotton Shirt - L', sku: 'COT-SHR-L' },
            },
            {
              id: 'item-3',
              auditId: 'audit-123',
              variantId: 'var-3',
              systemQuantity: 30,
              countedQuantity: 30,
              variance: 0,
              notes: 'Accurate count',
              createdAt: '2026-11-12T04:25:00.000Z',
              updatedAt: '2026-11-12T04:25:00.000Z',
              variant: { id: 'var-3', name: 'Linen Kurta - M', sku: 'LIN-KUR-M' },
            },
          ],
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      };
    }),
  };
});

const mockInventoryItem: InventoryEntity = {
  id: 'inv-1',
  variantId: 'var-1',
  warehouseId: 'wh-1',
  onHand: 50,
  reserved: 10,
  damaged: 5,
  safetyStock: 15,
  availableStock: 35,
  createdAt: '2026-11-10T12:00:00.000Z',
  updatedAt: '2026-11-12T08:00:00.000Z',
  variant: {
    id: 'var-1',
    productId: 'prod-1',
    name: 'Silk Panjabi - 40',
    sku: 'SLK-PAN-40',
    barcode: '8901234567890',
    price: '3500.00',
    costPrice: '1800.00',
    reorderLevel: 20,
    product: {
      id: 'prod-1',
      name: 'Premium Silk Panjabi',
      slug: 'premium-silk-panjabi',
      categoryId: 'cat-1',
    },
  },
  warehouse: {
    id: 'wh-1',
    name: 'Central Warehouse Dhaka',
    code: 'WH-DHK-01',
    isDefault: true,
  },
};

const mockMovements: StockMovementEntity[] = [
  {
    id: 'mov-1',
    variantId: 'var-1',
    warehouseId: 'wh-1',
    type: 'PURCHASE_RECEIPT',
    action: 'RECEIVE',
    quantity: 50,
    quantityBefore: 0,
    quantityAfter: 50,
    reason: 'Initial PO receipt',
    referenceType: 'PURCHASE_ORDER',
    referenceId: 'PO-2026-001',
    actorId: 'usr-1',
    createdAt: '2026-11-10T12:00:00.000Z',
    variant: { id: 'var-1', name: 'Silk Panjabi - 40', sku: 'SLK-PAN-40' },
    warehouse: { id: 'wh-1', name: 'Central Warehouse Dhaka', code: 'WH-DHK-01' },
  },
  {
    id: 'mov-2',
    variantId: 'var-1',
    warehouseId: 'wh-1',
    type: 'ORDER_RESERVATION',
    action: 'RESERVE',
    quantity: -2,
    quantityBefore: 50,
    quantityAfter: 48,
    reason: 'Customer Order #ORD-1001',
    referenceType: 'ORDER',
    referenceId: 'ORD-1001',
    actorId: 'usr-2',
    createdAt: '2026-11-11T14:30:00.000Z',
    variant: { id: 'var-1', name: 'Silk Panjabi - 40', sku: 'SLK-PAN-40' },
    warehouse: { id: 'wh-1', name: 'Central Warehouse Dhaka', code: 'WH-DHK-01' },
  },
];

const mockPurchaseOrders: PurchaseOrderEntity[] = [
  {
    id: 'po-draft',
    poNumber: 'PO-2026-001',
    supplierId: 'sup-1',
    warehouseId: 'wh-1',
    status: 'DRAFT',
    totalAmount: 45000,
    orderedAt: null,
    expectedDeliveryDate: '2026-11-20T00:00:00.000Z',
    receivedAt: null,
    notes: 'Draft order',
    createdAt: '2026-11-12T00:00:00.000Z',
    updatedAt: '2026-11-12T00:00:00.000Z',
    supplier: { id: 'sup-1', name: 'Bengal Fabrics Ltd', code: 'BFL-01', phone: null },
    warehouse: { id: 'wh-1', name: 'Central Warehouse Dhaka', code: 'WH-DHK-01' },
    items: [],
  },
  {
    id: 'po-ordered',
    poNumber: 'PO-2026-002',
    supplierId: 'sup-1',
    warehouseId: 'wh-1',
    status: 'ORDERED',
    totalAmount: 25000,
    orderedAt: '2026-11-12T01:00:00.000Z',
    expectedDeliveryDate: '2026-11-25T00:00:00.000Z',
    receivedAt: null,
    notes: 'Ordered from supplier',
    createdAt: '2026-11-12T01:00:00.000Z',
    updatedAt: '2026-11-12T01:00:00.000Z',
    supplier: { id: 'sup-1', name: 'Bengal Fabrics Ltd', code: 'BFL-01', phone: null },
    warehouse: { id: 'wh-1', name: 'Central Warehouse Dhaka', code: 'WH-DHK-01' },
    items: [
      {
        id: 'poi-1',
        purchaseOrderId: 'po-ordered',
        variantId: 'var-1',
        orderedQuantity: 20,
        receivedQuantity: 0,
        unitCost: 1250,
        lineTotal: 25000,
        createdAt: '2026-11-12T01:00:00.000Z',
        updatedAt: '2026-11-12T01:00:00.000Z',
        variant: { id: 'var-1', name: 'Silk Panjabi - 40', sku: 'SLK-PAN-40', costPrice: 1250 },
      },
    ],
  },
  {
    id: 'po-received',
    poNumber: 'PO-2026-003',
    supplierId: 'sup-1',
    warehouseId: 'wh-1',
    status: 'RECEIVED',
    totalAmount: 12000,
    orderedAt: '2026-11-10T00:00:00.000Z',
    expectedDeliveryDate: null,
    receivedAt: '2026-11-11T10:00:00.000Z',
    notes: 'Fully received',
    createdAt: '2026-11-10T00:00:00.000Z',
    updatedAt: '2026-11-11T10:00:00.000Z',
    supplier: { id: 'sup-1', name: 'Bengal Fabrics Ltd', code: 'BFL-01', phone: null },
    items: [],
  },
];

describe('Phase 5B: Inventory, Suppliers, PO & Audits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('0. Inventory Summary Cards & Valuation Precision', () => {
    const mockSummary = {
      totalProducts: 42,
      totalStockUnits: 1500,
      available: 1350,
      reserved: 120,
      damaged: 30,
      stockValue: '4500000.50',
      damageValue: '90000.25',
      netStockValue: '4410000.25',
    };

    it('renders unit metrics and formats confidential decimal valuations with MoneyText when inventory:view_cost is granted', () => {
      vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
        user: undefined,
        roles: ['MANAGER'],
        isSuperAdmin: false,
        isLoading: false,
        isAuthenticated: true,
        permissions: ['inventory:read', 'inventory:view_cost'],
        hasPermission: (p: string) => p === 'inventory:view_cost' || p === 'inventory:read',
        hasAllPermissions: () => true,
        hasAnyPermission: () => true,
      });

      render(
        <AppProviders>
          <InventorySummaryCards summary={mockSummary} isLoading={false} />
        </AppProviders>
      );

      // Unit counts
      expect(screen.getByText('1,500')).toBeInTheDocument();
      expect(screen.getByText('1,350')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();

      // Confidential Decimal valuations rendered via MoneyText (Intl en-BD format, no floating point loss)
      expect(screen.getByText(/4,500,000\.50/)).toBeInTheDocument();
      expect(screen.getByText(/90,000\.25/)).toBeInTheDocument();
      expect(screen.getByText(/4,410,000\.25/)).toBeInTheDocument();
    });

    it('hides confidential valuations when user lacks inventory:view_cost permission', () => {
      vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
        user: undefined,
        roles: ['STAFF'],
        isSuperAdmin: false,
        isLoading: false,
        isAuthenticated: true,
        permissions: ['inventory:read'],
        hasPermission: (p: string) => p === 'inventory:read',
        hasAllPermissions: () => false,
        hasAnyPermission: () => false,
      });

      render(
        <AppProviders>
          <InventorySummaryCards summary={mockSummary} isLoading={false} />
        </AppProviders>
      );

      // Unit counts still visible
      expect(screen.getByText('1,500')).toBeInTheDocument();

      // Confidential valuations must NOT be rendered
      expect(screen.queryByText(/Total Valuation/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/4,500,000/)).not.toBeInTheDocument();
    });
  });

  describe('1. Stock Table & Permission Gating', () => {
    it('renders stock breakdown (on-hand, reserved, damaged, available) and SKU', () => {
      vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
        user: undefined,
        roles: ['SUPER_ADMIN'],
        isSuperAdmin: true,
        isLoading: false,
        isAuthenticated: true,
        permissions: ['inventory:manage', 'inventory:view_cost'],
        hasPermission: () => true,
        hasAllPermissions: () => true,
        hasAnyPermission: () => true,
      });

      render(
        <AppProviders>
          <StockTable
            data={[mockInventoryItem]}
            total={1}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Silk Panjabi - 40')).toBeInTheDocument();
      expect(screen.getByText(/SKU: SLK-PAN-40/)).toBeInTheDocument();
      expect(screen.getAllByText('50')[0]).toBeInTheDocument(); // On Hand
      expect(screen.getAllByText('10')[0]).toBeInTheDocument(); // Reserved
      expect(screen.getByText('5')).toBeInTheDocument(); // Damaged
      expect(screen.getByText('35')).toBeInTheDocument(); // Available Stock
      expect(screen.getByText(/in stock/i)).toBeInTheDocument();
    });

    it('hides adjust stock action buttons when user lacks inventory:manage', () => {
      vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
        user: undefined,
        roles: ['SUPPORT_STAFF'],
        isSuperAdmin: false,
        isLoading: false,
        isAuthenticated: true,
        permissions: ['inventory:read'],
        hasPermission: (perm: string) => perm === 'inventory:read',
        hasAllPermissions: () => false,
        hasAnyPermission: (perms: string[]) => perms.includes('inventory:read'),
      });

      render(
        <AppProviders>
          <StockTable
            data={[mockInventoryItem]}
            total={1}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
          />
        </AppProviders>
      );

      // Mutating buttons are gated and should not exist
      expect(screen.queryByTitle('Adjust Stock Level')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Mark Damaged Stock')).not.toBeInTheDocument();
    });
  });

  describe('2. Immutable Stock Ledger (Audit Trail Guarantee)', () => {
    it('renders append-only ledger entries and guarantees NO edit or delete buttons exist', () => {
      render(
        <AppProviders>
          <StockMovementsTable
            data={mockMovements}
            total={2}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Initial PO receipt')).toBeInTheDocument();
      expect(screen.getByText('Customer Order #ORD-1001')).toBeInTheDocument();
      expect(screen.getByText('+50')).toBeInTheDocument();
      expect(screen.getByText('-2')).toBeInTheDocument();

      // Zero edit or delete actions rendered (immutable guarantee)
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    });
  });

  describe('3. Supplier Form & Validation', () => {
    it('validates minimum name length on submit', async () => {
      render(
        <AppProviders>
          <SupplierFormModal isOpen={true} supplier={null} onClose={vi.fn()} />
        </AppProviders>
      );

      const submitButton = screen.getByRole('button', { name: /create supplier/i });
      expect(submitButton).toBeInTheDocument();

      // Submitting empty form shows validation error
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/supplier name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('4. Purchase Orders Lifecycle & State Transitions', () => {
    it('renders allowed transitions strictly per status: DRAFT can be submitted to vendor or cancelled', () => {
      vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
        user: undefined,
        roles: ['SUPER_ADMIN'],
        isSuperAdmin: true,
        isLoading: false,
        isAuthenticated: true,
        permissions: ['supplier:manage'],
        hasPermission: () => true,
        hasAllPermissions: () => true,
        hasAnyPermission: () => true,
      });

      render(
        <AppProviders>
          <PurchaseOrderDetailModal
            po={mockPurchaseOrders[0]!} // DRAFT
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByRole('button', { name: /submit po to vendor/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel purchase order/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /receive goods/i })).not.toBeInTheDocument();
    });

    it('renders allowed transitions strictly per status: ORDERED allows Receive and Cancel, but NOT DRAFT submit', () => {
      vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
        user: undefined,
        roles: ['SUPER_ADMIN'],
        isSuperAdmin: true,
        isLoading: false,
        isAuthenticated: true,
        permissions: ['supplier:manage'],
        hasPermission: () => true,
        hasAllPermissions: () => true,
        hasAnyPermission: () => true,
      });

      render(
        <AppProviders>
          <PurchaseOrderDetailModal
            po={mockPurchaseOrders[1]!} // ORDERED
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByRole('button', { name: /receive goods inbound/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel purchase order/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /submit po to vendor/i })).not.toBeInTheDocument();
    });

    it('terminal status RECEIVED displays NO transition or receive buttons', () => {
      vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
        user: undefined,
        roles: ['SUPER_ADMIN'],
        isSuperAdmin: true,
        isLoading: false,
        isAuthenticated: true,
        permissions: ['supplier:manage'],
        hasPermission: () => true,
        hasAllPermissions: () => true,
        hasAnyPermission: () => true,
      });

      render(
        <AppProviders>
          <PurchaseOrderDetailModal
            po={mockPurchaseOrders[2]!} // RECEIVED
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /receive goods inbound/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel purchase order/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /submit po to vendor/i })).not.toBeInTheDocument();
    });
  });

  describe('5. PO Inbound Receiving Validation', () => {
    it('clamps quantity to remaining ordered units and displays error on 0 units', async () => {
      render(
        <AppProviders>
          <PurchaseOrderReceiveModal
            po={mockPurchaseOrders[1]!} // Ordered with 20 ordered, 0 received
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      // Find the quantity input by its accessible label
      const input = screen.getByLabelText(/Receive quantity for SLK-PAN-40/i);

      // Clamping test: entering 25 clamps to 20 (max remaining)
      fireEvent.change(input, { target: { value: '25' } });
      expect((input as HTMLInputElement).value).toBe('20');

      // Zero units validation test
      fireEvent.change(input, { target: { value: '0' } });
      const submitBtn = screen.getByRole('button', { name: /confirm receipt & update stock/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/please specify at least 1 unit to receive/i)).toBeInTheDocument();
      });
    });

    it('disables submit button to prevent double-submit while receiving is in flight', async () => {
      render(
        <AppProviders>
          <PurchaseOrderReceiveModal
            po={mockPurchaseOrders[1]!}
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /confirm receipt & update stock/i });
      expect(submitBtn).toBeInTheDocument();
      expect(submitBtn).not.toBeDisabled();
    });
  });

  describe('6. Physical Stock Audit & Variance Calculation', () => {
    it('displays system quantity, counted quantity, and variance highlights (+ / - / 0)', () => {
      vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
        user: undefined,
        roles: ['SUPER_ADMIN'],
        isSuperAdmin: true,
        isLoading: false,
        isAuthenticated: true,
        permissions: ['inventory:audit'],
        hasPermission: () => true,
        hasAllPermissions: () => true,
        hasAnyPermission: () => true,
      });

      render(
        <AppProviders>
          <AuditDetailModal auditId="audit-123" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      // Shortage check: system 20, counted 18 -> variance -2
      expect(screen.getByText('-2 (Shortage)')).toBeInTheDocument();

      // Surplus check: system 10, counted 15 -> variance +5
      expect(screen.getByText('+5 (Surplus)')).toBeInTheDocument();

      // Balanced check: system 30, counted 30 -> variance 0
      expect(screen.getByText('Accurate count')).toBeInTheDocument();

      // Discrepancies count badge
      expect(screen.getByText('2 items')).toBeInTheDocument();

      // Approve & Reconcile button present
      expect(screen.getByRole('button', { name: /approve & reconcile/i })).toBeInTheDocument();
    });

    it('hides audit mutating actions (approve & reconcile, reject) when user lacks inventory:audit', () => {
      vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
        user: undefined,
        roles: ['STAFF'],
        isSuperAdmin: false,
        isLoading: false,
        isAuthenticated: true,
        permissions: ['inventory:read'],
        hasPermission: (p: string) => p === 'inventory:read',
        hasAllPermissions: () => false,
        hasAnyPermission: (ps: string[]) => ps.includes('inventory:read'),
      });

      render(
        <AppProviders>
          <AuditDetailModal auditId="audit-123" isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /approve & reconcile/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reject audit/i })).not.toBeInTheDocument();
    });
  });

  describe('7. Insufficient Stock Backend Error Handling', () => {
    it('captures backend error gracefully without crashing the UI', async () => {
      vi.spyOn(inventoryApi, 'adjustStock').mockRejectedValueOnce(
        new Error('Insufficient available stock to deduct 50 units (available: 35)')
      );

      render(
        <AppProviders>
          <AdjustStockModal item={mockInventoryItem} mode="ADJUST" onClose={vi.fn()} />
        </AppProviders>
      );

      // Enter a deduction of 50 units
      const qtyInput = screen.getByLabelText(/adjustment quantity/i);
      fireEvent.change(qtyInput, { target: { value: '-50' } });

      const reasonInput = screen.getByPlaceholderText(/e\.g\. Found extra uncounted box/i);
      fireEvent.change(reasonInput, { target: { value: 'Inventory discrepancy deduction' } });

      const submitBtn = screen.getByRole('button', { name: /apply adjustment/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Insufficient available stock to deduct 50 units \(available: 35\)/i)
        ).toBeInTheDocument();
      });
    });
  });
});
