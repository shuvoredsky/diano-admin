import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  ZonesList,
  MethodsTable,
  ZoneFormModal,
  MethodFormModal,
  UpdateShipmentModal,
  OrderShipmentsSection,
  type ShippingZoneEntity,
  type ShippingMethodEntity,
  type ShipmentEntity,
} from '@/features/shipping';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as ShippingQueriesModule from '@/features/shipping/hooks/use-shipping-queries';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/shipping',
  useSearchParams: () => new URLSearchParams(),
}));

const mockCreateZoneMutateAsync = vi.fn();
const mockUpdateZoneMutateAsync = vi.fn();
const mockDeleteZoneMutateAsync = vi.fn();
const mockCreateMethodMutateAsync = vi.fn();
const mockUpdateMethodMutateAsync = vi.fn();
const mockDeleteMethodMutateAsync = vi.fn();
const mockUpdateShipmentMutateAsync = vi.fn();

vi.mock('@/features/shipping/hooks/use-shipping-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof ShippingQueriesModule>();
  return {
    ...actual,
    useCreateZoneMutation: vi.fn(() => ({
      mutateAsync: mockCreateZoneMutateAsync,
      isPending: false,
    })),
    useUpdateZoneMutation: vi.fn(() => ({
      mutateAsync: mockUpdateZoneMutateAsync,
      isPending: false,
    })),
    useDeleteZoneMutation: vi.fn(() => ({
      mutateAsync: mockDeleteZoneMutateAsync,
      isPending: false,
    })),
    useCreateMethodMutation: vi.fn(() => ({
      mutateAsync: mockCreateMethodMutateAsync,
      isPending: false,
    })),
    useUpdateMethodMutation: vi.fn(() => ({
      mutateAsync: mockUpdateMethodMutateAsync,
      isPending: false,
    })),
    useDeleteMethodMutation: vi.fn(() => ({
      mutateAsync: mockDeleteMethodMutateAsync,
      isPending: false,
    })),
    useUpdateShipmentStatusMutation: vi.fn(() => ({
      mutateAsync: mockUpdateShipmentMutateAsync,
      isPending: false,
    })),
  };
});

const mockZones: ShippingZoneEntity[] = [
  {
    id: 'zone-dhaka',
    name: 'Inside Dhaka City',
    districts: ['Dhaka', 'Gazipur'],
    isActive: true,
    createdAt: '2026-11-10T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z',
    methods: [],
  },
  {
    id: 'zone-outside',
    name: 'Outside Dhaka',
    districts: ['Chattogram', 'Sylhet', 'Rajshahi'],
    isActive: false,
    createdAt: '2026-11-10T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z',
    methods: [],
  },
];

const mockMethods: ShippingMethodEntity[] = [
  {
    id: 'method-std-dhk',
    shippingZoneId: 'zone-dhaka',
    name: 'Standard Dhaka Home Delivery',
    code: 'STD-DHK',
    baseCharge: '60.00',
    perKgCharge: '0.00',
    freeShippingThreshold: '1000.00',
    estimatedDays: '1-2 Days',
    sortOrder: 0,
    isActive: true,
    createdAt: '2026-11-10T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z',
    shippingZone: mockZones[0],
  },
];

const mockShipment: ShipmentEntity = {
  id: 'ship-101',
  orderId: 'ord-1001',
  courierName: 'Steadfast Courier',
  trackingNumber: 'ST-998877',
  status: 'IN_TRANSIT',
  createdAt: '2026-11-12T12:00:00.000Z',
  updatedAt: '2026-11-13T14:00:00.000Z',
  events: [
    {
      id: 'evt-1',
      shipmentId: 'ship-101',
      status: 'PICKED_UP',
      location: 'Central Warehouse Dhaka',
      description: 'Handed over to courier driver',
      occurredAt: '2026-11-12T14:00:00.000Z',
      createdAt: '2026-11-12T14:00:00.000Z',
    },
  ],
};

function setupPermissions(permissions: string[], isSuperAdmin = false) {
  vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
    permissions,
    isSuperAdmin,
    roles: isSuperAdmin ? ['ADMIN'] : ['STAFF'],
    user: { id: 'usr-admin', email: 'admin@diano.com', name: 'Admin', roles: ['ADMIN'] },
    hasPermission: (perm: string) => isSuperAdmin || permissions.includes(perm),
    hasAnyPermission: (perms: string[]) => isSuperAdmin || perms.some((p) => permissions.includes(p)),
    hasAllPermissions: (perms: string[]) => isSuperAdmin || perms.every((p) => permissions.includes(p)),
    isLoading: false,
    isAuthenticated: true,
  });
}

describe('Phase 7B: Shipping & Logistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupPermissions(['shipping:read', 'shipping:manage', 'order:read', 'order:ship'], true);
  });

  describe('1. Zones List & Modal', () => {
    it('renders delivery zones list with covered districts and status badges', () => {
      render(
        <AppProviders>
          <ZonesList
            zones={mockZones}
            isLoading={false}
            onEditZone={vi.fn()}
            onCreateZone={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Inside Dhaka City')).toBeInTheDocument();
      expect(screen.getByText('Outside Dhaka')).toBeInTheDocument();
      expect(screen.getByText('Dhaka')).toBeInTheDocument();
      expect(screen.getByText('Gazipur')).toBeInTheDocument();
    });

    it('validates zone name and district selection in ZoneFormModal', async () => {
      render(
        <AppProviders>
          <ZoneFormModal isOpen={true} onClose={vi.fn()} />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /create zone/i });
      fireEvent.click(submitBtn);

      expect(mockCreateZoneMutateAsync).not.toHaveBeenCalled();

      // Enter name and select district
      const nameInput = screen.getByLabelText(/zone name/i);
      fireEvent.change(nameInput, { target: { value: 'Chittagong Metro' } });

      const dhakaBtn = screen.getByRole('button', { name: /Dhaka/i });
      fireEvent.click(dhakaBtn);

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateZoneMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Chittagong Metro',
            districts: expect.arrayContaining(['Dhaka']),
            isActive: true,
          })
        );
      });
    });
  });

  describe('2. Shipping Methods Table & Modal', () => {
    it('renders methods table with base charge and free threshold', () => {
      render(
        <AppProviders>
          <MethodsTable
            methods={mockMethods}
            isLoading={false}
            onEditMethod={vi.fn()}
            onCreateMethod={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Standard Dhaka Home Delivery')).toBeInTheDocument();
      expect(screen.getByText('STD-DHK')).toBeInTheDocument();
      expect(screen.getByText('1-2 Days')).toBeInTheDocument();
    });

    it('submits new shipping method with uppercase code and zero-float validation', async () => {
      render(
        <AppProviders>
          <MethodFormModal isOpen={true} onClose={vi.fn()} zones={mockZones} />
        </AppProviders>
      );

      const nameInput = screen.getByLabelText(/method name/i);
      const codeInput = screen.getByLabelText(/method code/i);
      const baseChargeInput = screen.getByLabelText(/base charge/i);
      const estDaysInput = screen.getByLabelText(/estimated delivery/i);

      fireEvent.change(nameInput, { target: { value: 'Express Next-Day' } });
      fireEvent.change(codeInput, { target: { value: 'exp-dhk' } });
      fireEvent.change(baseChargeInput, { target: { value: '120.00' } });
      fireEvent.change(estDaysInput, { target: { value: '24 Hours' } });

      const submitBtn = screen.getByRole('button', { name: /create method/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateMethodMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Express Next-Day',
            code: 'EXP-DHK',
            baseCharge: '120.00',
            estimatedDays: '24 Hours',
          })
        );
      });
    });
  });

  describe('3. Shipment Management & Status Updates', () => {
    it('renders shipment tracking and checkpoints in OrderShipmentsSection', () => {
      render(
        <AppProviders>
          <OrderShipmentsSection
            orderId="ord-1001"
            orderNumber="ORD-202611-0001"
            shipments={[mockShipment]}
          />
        </AppProviders>
      );

      expect(screen.getByText('Steadfast Courier')).toBeInTheDocument();
      expect(screen.getByText('ST-998877')).toBeInTheDocument();
      expect(screen.getByText('Handed over to courier driver')).toBeInTheDocument();
      expect(screen.getByText('Central Warehouse Dhaka')).toBeInTheDocument();
    });

    it('updates shipment status via UpdateShipmentModal', async () => {
      render(
        <AppProviders>
          <UpdateShipmentModal
            isOpen={true}
            onClose={vi.fn()}
            shipment={mockShipment}
            orderId="ord-1001"
          />
        </AppProviders>
      );

      const statusSelect = screen.getByLabelText(/new shipment status/i);
      fireEvent.change(statusSelect, { target: { value: 'OUT_FOR_DELIVERY' } });

      const locationInput = screen.getByLabelText(/current location/i);
      fireEvent.change(locationInput, { target: { value: 'Dhanmondi Hub' } });

      const submitBtn = screen.getByRole('button', { name: /update status/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockUpdateShipmentMutateAsync).toHaveBeenCalledWith({
          shipmentId: 'ship-101',
          orderId: 'ord-1001',
          input: {
            status: 'OUT_FOR_DELIVERY',
            location: 'Dhanmondi Hub',
          },
        });
      });
    });
  });
});

