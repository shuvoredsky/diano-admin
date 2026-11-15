'use client';

import { useState } from 'react';
import { ShoppingBag, TrendingUp, Boxes, Users, Landmark, Info } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { REPORT_DOMAINS } from '../constants/reports.constants';
import { OrdersReportTab } from './orders-report-tab';
import { SalesReportTab } from './sales-report-tab';
import { InventoryReportTab } from './inventory-report-tab';
import { CustomersReportTab } from './customers-report-tab';
import { FinancialReportTab } from './financial-report-tab';
import type { ReportDomain } from '../types/reports.types';

export function ReportsManager() {
  const [activeTab, setActiveTab] = useState<ReportDomain>('orders');

  const icons: Record<ReportDomain, React.ElementType> = {
    orders: ShoppingBag,
    sales: TrendingUp,
    inventory: Boxes,
    customers: Users,
    financial: Landmark,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Data Export"
        description="Generate and export streaming CSV, Excel, and PDF business reports across key operational domains."
      />

      {/* BG-07 Notice Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary-deep dark:text-primary">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Backend Data Export Coverage (BG-07)</p>
          <p className="text-muted-foreground mt-0.5">
            Full operational data for products, payments, and store operating expenses is integrated directly into the
            Financial, Inventory, and Sales export streams. Exports are streamed directly via authenticated binary blobs.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border/60 gap-2 overflow-x-auto pb-px">
        {REPORT_DOMAINS.map((domain) => {
          const Icon = icons[domain.id];
          const isActive = activeTab === domain.id;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => setActiveTab(domain.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{domain.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {activeTab === 'orders' && <OrdersReportTab />}
      {activeTab === 'sales' && <SalesReportTab />}
      {activeTab === 'inventory' && <InventoryReportTab />}
      {activeTab === 'customers' && <CustomersReportTab />}
      {activeTab === 'financial' && <FinancialReportTab />}
    </div>
  );
}

