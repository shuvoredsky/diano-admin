'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import {
  MoneyText,
  DateText,
  StatusBadge,
  KpiCard,
  PermissionGate,
  Timeline,
} from '@/components/shared';
import { DataTable, FilterBar } from '@/components/tables';
import {
  FormField,
  DateRangePicker,
  ImageSlotUploader,
  RichTextEditor,
} from '@/components/forms';
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
} from '@/components/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Users, DollarSign, Package } from 'lucide-react';

interface SampleOrder extends Record<string, unknown> {
  id: string;
  orderNumber: string;
  customer: string;
  total: string;
  status: string;
  createdAt: string;
}

const sampleOrders: SampleOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-9821',
    customer: 'Tanvir Ahmed',
    total: '12450.00',
    status: 'DELIVERED',
    createdAt: '2026-11-11T14:30:00.000Z',
  },
  {
    id: '2',
    orderNumber: 'ORD-9822',
    customer: 'Farzana Yasmin',
    total: '3500.50',
    status: 'PENDING',
    createdAt: '2026-11-11T12:15:00.000Z',
  },
  {
    id: '3',
    orderNumber: 'ORD-9823',
    customer: 'Shakil Mahmud',
    total: '890.00',
    status: 'CANCELLED',
    createdAt: '2026-11-10T09:00:00.000Z',
  },
  {
    id: '4',
    orderNumber: 'ORD-9824',
    customer: 'Ayesha Siddiqua',
    total: '6700.00',
    status: 'PROCESSING',
    createdAt: '2026-11-09T18:45:00.000Z',
  },
];

export default function ComponentShowcasePage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [richText, setRichText] = useState('### Product Features\n- 100% Organic Cotton\n- Breathable fabric');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '2026-11-01',
    endDate: '2026-11-11',
  });

  const sampleColumns = [
    { key: 'orderNumber', header: 'Order #' },
    { key: 'customer', header: 'Customer' },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (row: SampleOrder) => <MoneyText amount={row.total} colored />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: SampleOrder) => <StatusBadge status={row.status} pulse={row.status === 'PROCESSING'} />,
    },
    {
      key: 'createdAt',
      header: 'Date (Dhaka)',
      render: (row: SampleOrder) => <DateText date={row.createdAt} showTimezone />,
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Component Showcase & Design System"
        description="Comprehensive preview of Phase 2 tokens, components, form controls, and feedback states."
        actions={
          <Button variant="default" onClick={() => setConfirmOpen(true)}>
            Open Confirm Dialog
          </Button>
        }
      />

      {/* 1. Design Tokens & Pastel Palettes */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          1. Color Tokens & Pastel Palettes
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          <div className="rounded-xl border border-border bg-mint p-4 text-center">
            <span className="font-semibold text-xs text-primary-deep">Mint #DCEFE3</span>
          </div>
          <div className="rounded-xl border border-border bg-primary p-4 text-center">
            <span className="font-semibold text-xs text-white">Primary #15965F</span>
          </div>
          <div className="rounded-xl border border-border bg-primary-deep p-4 text-center">
            <span className="font-semibold text-xs text-white">Deep #146B45</span>
          </div>
          <div className="rounded-xl border border-border bg-pastel-lavender p-4 text-center">
            <span className="font-semibold text-xs text-pastel-lavender-foreground">Lavender</span>
          </div>
          <div className="rounded-xl border border-border bg-pastel-sky p-4 text-center">
            <span className="font-semibold text-xs text-pastel-sky-foreground">Sky</span>
          </div>
          <div className="rounded-xl border border-border bg-pastel-peach p-4 text-center">
            <span className="font-semibold text-xs text-pastel-peach-foreground">Peach</span>
          </div>
        </div>
      </section>

      {/* 2. KPI Cards (Strict null percent check & pastels) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          2. KPI Cards (Pastels & Strict Rules)
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Revenue"
            current="1284500.00"
            previous="1150000.00"
            percent={11.7}
            trend="UP"
            isCurrency
            pastel="softgreen"
            icon={<DollarSign className="h-4 w-4 text-primary" />}
            note="Month-to-date"
          />
          <KpiCard
            title="Delivered Orders"
            current={482}
            previous={510}
            percent={-5.5}
            trend="DOWN"
            pastel="peach"
            icon={<ShoppingBag className="h-4 w-4 text-warning" />}
            note="vs Last Month"
          />
          <KpiCard
            title="New Customers"
            current={89}
            previous={null}
            percent={null} // Strict test: must render "—"
            trend="NONE"
            pastel="sky"
            icon={<Users className="h-4 w-4 text-info" />}
            note="No historical baseline"
          />
          <KpiCard
            title="Active Inventory"
            current="3,412"
            previous="3,200"
            percent={6.6}
            trend="UP"
            pastel="lavender"
            icon={<Package className="h-4 w-4 text-purple" />}
            note="Healthy stock"
          />
        </div>
      </section>

      {/* 3. Status Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          3. Status Badges & Pulse
        </h2>
        <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-border bg-card">
          <StatusBadge status="DELIVERED" />
          <StatusBadge status="PROCESSING" pulse />
          <StatusBadge status="PENDING" />
          <StatusBadge status="CANCELLED" />
          <StatusBadge status="REFUNDED" />
          <StatusBadge status="LOW_STOCK" />
          <StatusBadge status="CRITICAL" pulse />
          <StatusBadge status="ACTIVE" />
          <StatusBadge status="DRAFT" />
        </div>
      </section>

      {/* 4. Money & Date Formatters */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          4. MoneyText & DateText (BDT & Asia/Dhaka)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">MoneyText Variations</h3>
            <div className="flex items-center gap-4">
              <MoneyText amount="1250000.75" size="2xl" colored />
              <MoneyText amount="-450.00" colored />
              <MoneyText amount="0" colored />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">DateText Variations (Dhaka UTC+6)</h3>
            <div className="flex flex-col gap-1 text-sm">
              <DateText date="2026-11-11T12:00:00.000Z" format="datetime" showTimezone />
              <DateText date="2026-11-11T12:00:00.000Z" format="relative" />
              <DateText date={null} fallback="No date supplied" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. DataTable & FilterBar */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          5. DataTable & FilterBar
        </h2>
        <FilterBar
          searchPlaceholder="Filter orders by customer or id..."
        />
        <DataTable
          columns={sampleColumns}
          data={sampleOrders}
          total={sampleOrders.length}
          syncWithUrl={false}
        />
      </section>

      {/* 6. Form Controls */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          6. Form Controls (DateRangePicker, FormField, ImageSlots, RichText)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-border bg-card">
          <div className="space-y-4">
            <FormField label="Order Recipient" required description="Full name as printed on national ID">
              <Input placeholder="Enter recipient name" />
            </FormField>

            <div>
              <span className="block text-sm font-semibold mb-2">Dhaka Date Range Picker</span>
              <DateRangePicker
                value={dateRange}
                onChange={range => setDateRange(range)}
              />
            </div>

            <div>
              <span className="block text-sm font-semibold mb-2">Image Slot Uploader</span>
              <ImageSlotUploader slot="thumbnail" />
            </div>
          </div>

          <div className="space-y-4">
            <span className="block text-sm font-semibold mb-2">Rich Text Markdown Editor</span>
            <RichTextEditor value={richText} onChange={setRichText} />
          </div>
        </div>
      </section>

      {/* 7. Feedback States & Timeline */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          7. Feedback States, Skeletons & Timeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EmptyState
            title="Empty Catalog"
            description="No products have been added to this category yet."
            action={<Button size="sm">Create Product</Button>}
          />
          <ErrorState
            title="Connection Timeout"
            message="Unable to fetch real-time analytics data from server."
            onRetry={() => {}}
          />
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="font-semibold text-sm mb-3">Audit Trail Timeline</h3>
            <Timeline
              events={[
                {
                  id: 'e1',
                  title: 'ORDER_PLACED',
                  description: 'Customer placed order via COD checkout',
                  actor: 'Customer (Tanvir)',
                  timestamp: '2026-11-11T12:00:00Z',
                  status: 'PENDING',
                },
                {
                  id: 'e2',
                  title: 'PAYMENT_VERIFIED',
                  description: 'Invoice generated automatically',
                  actor: 'System',
                  timestamp: '2026-11-11T12:05:00Z',
                  status: 'DELIVERED',
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 8. Permission Gate Showcase */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          8. Permission Gate & Can Component
        </h2>
        <div className="p-4 rounded-xl border border-border bg-card space-y-2">
          <PermissionGate
            permission="analytics:view"
            fallback={<span className="text-sm text-destructive">Restricted: Requires analytics:view permission</span>}
          >
            <div className="text-sm text-primary-deep font-semibold">
              ✓ Access Granted: Current user has permission to view analytics.
            </div>
          </PermissionGate>
        </div>
      </section>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Irreversible Action"
        description="Are you sure you want to proceed with this administrative change? This action will be recorded in the Dhaka audit trail."
        confirmLabel="Proceed"
        variant="destructive"
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}
