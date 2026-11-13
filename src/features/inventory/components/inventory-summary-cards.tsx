'use client';

import { Package, CheckCircle2, Clock, AlertTriangle, DollarSign, ShieldAlert } from 'lucide-react';
import { MoneyText } from '@/components/shared/money-text';
import { usePermissions } from '@/hooks/use-permissions';
import type { InventorySummaryDto } from '../types/inventory.types';

export interface InventorySummaryCardsProps {
  summary?: InventorySummaryDto;
  isLoading?: boolean;
}

export function InventorySummaryCards({ summary, isLoading }: InventorySummaryCardsProps) {
  const { hasPermission } = usePermissions();
  const canViewCost = hasPermission('inventory:view_cost');

  const unitCards = [
    {
      title: 'Total Stock Units',
      value: summary?.totalStockUnits ?? 0,
      icon: Package,
      color: 'bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary',
      description: `${summary?.totalProducts ?? 0} tracked product lines`,
    },
    {
      title: 'Available for Sale',
      value: summary?.available ?? 0,
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      description: 'Ready for customer orders',
    },
    {
      title: 'Reserved Units',
      value: summary?.reserved ?? 0,
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      description: 'Allocated to pending checkouts',
    },
    {
      title: 'Damaged / Quarantined',
      value: summary?.damaged ?? 0,
      icon: AlertTriangle,
      color: 'bg-destructive/10 text-destructive',
      description: 'Defective or expired goods',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Unit Quantity Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {unitCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-2xs transition-colors hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{card.title}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                {isLoading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
                ) : (
                  <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                    {card.value.toLocaleString('en-US')}
                  </div>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confidential Financial Valuations (Gated by inventory:view_cost) */}
      {canViewCost ? (
        (summary?.stockValue || summary?.damageValue || summary?.netStockValue) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-2xl border border-primary/20 bg-mint/10 dark:bg-mint/5 p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-deep dark:text-primary block">
                  Total Valuation (Gross)
                </span>
                <div className="text-base font-black text-primary-deep dark:text-primary">
                  <MoneyText amount={summary.stockValue ?? '0.00'} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-destructive block">
                  Damaged Stock Loss
                </span>
                <div className="text-base font-black text-destructive">
                  <MoneyText amount={summary.damageValue ?? '0.00'} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Net Active Valuation
                </span>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  <MoneyText amount={summary.netStockValue ?? summary.stockValue ?? '0.00'} />
                </div>
              </div>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
