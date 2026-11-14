'use client';

import { useTransition } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTableQueryParams } from '@/lib/crud';
import { createDhakaDate, formatDhakaDateOnly } from '@/lib/utils/dhaka-period';
import { ORDER_STATUS_LABELS } from '../constants/orders.constants';
import type { OrderStatus } from '../types/orders.types';

export function OrdersFilterBar() {
  const [, startTransition] = useTransition();
  const { searchParams, setFilter, resetFilters } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const paymentStatus = searchParams.get('paymentStatus') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';

  const hasActiveFilters = Boolean(search || status || paymentStatus || dateFrom || dateTo);

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setFilter('search', value ? value.trim() : null);
    });
  };

  const handleStatusChange = (value: string) => {
    startTransition(() => {
      setFilter('status', value || null);
    });
  };

  const handlePaymentStatusChange = (value: string) => {
    startTransition(() => {
      setFilter('paymentStatus', value || null);
    });
  };

  const handleDateFromChange = (dateVal: string) => {
    startTransition(() => {
      if (!dateVal) {
        setFilter('dateFrom', null);
        return;
      }
      const parts = dateVal.split('-').map(Number);
      const y = parts[0];
      const m = parts[1];
      const d = parts[2];
      if (y === undefined || m === undefined || d === undefined || isNaN(y) || isNaN(m) || isNaN(d)) {
        setFilter('dateFrom', null);
        return;
      }
      const iso = createDhakaDate(y, m, d, 0, 0, 0, 0).toISOString();
      setFilter('dateFrom', iso);
    });
  };

  const handleDateToChange = (dateVal: string) => {
    startTransition(() => {
      if (!dateVal) {
        setFilter('dateTo', null);
        return;
      }
      const parts = dateVal.split('-').map(Number);
      const y = parts[0];
      const m = parts[1];
      const d = parts[2];
      if (y === undefined || m === undefined || d === undefined || isNaN(y) || isNaN(m) || isNaN(d)) {
        setFilter('dateTo', null);
        return;
      }
      const iso = createDhakaDate(y, m, d, 23, 59, 59, 999).toISOString();
      setFilter('dateTo', iso);
    });
  };

  const rawDateFrom = dateFrom ? formatDhakaDateOnly(new Date(dateFrom)) : '';
  const rawDateTo = dateTo ? formatDhakaDateOnly(new Date(dateTo)) : '';

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order #, phone, customer..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Order Status Select */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          aria-label="Filter by order status"
          className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
        >
          <option value="">All Order Statuses</option>
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((st) => (
            <option key={st} value={st}>
              {ORDER_STATUS_LABELS[st]}
            </option>
          ))}
        </select>

        {/* Payment Status Select */}
        <select
          value={paymentStatus}
          onChange={(e) => handlePaymentStatusChange(e.target.value)}
          aria-label="Filter by payment status"
          className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
        >
          <option value="">All Payment Statuses</option>
          <option value="PENDING">Payment Pending</option>
          <option value="PROCESSING">Payment Processing</option>
          <option value="COMPLETED">Payment Completed</option>
          <option value="FAILED">Payment Failed</option>
          <option value="CANCELLED">Payment Cancelled</option>
          <option value="REFUNDED">Payment Refunded</option>
          <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
        </select>

        {/* Date Range Inputs (Asia/Dhaka) */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <span className="sr-only">Date From</span>
            <input
              type="date"
              aria-label="Date From (Asia/Dhaka)"
              value={rawDateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="h-9 rounded-xl border border-input bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
              title="Filter from date (Dhaka timezone)"
            />
          </div>
          <span className="text-xs text-muted-foreground">to</span>
          <div className="relative">
            <span className="sr-only">Date To</span>
            <input
              type="date"
              aria-label="Date To (Asia/Dhaka)"
              value={rawDateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
              className="h-9 rounded-xl border border-input bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
              title="Filter to date (Dhaka timezone)"
            />
          </div>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => resetFilters()}
            className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        <span>Live URL Filters</span>
      </div>
    </div>
  );
}
