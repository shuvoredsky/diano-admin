'use client';

import { Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUS_VARIANTS,
} from '../constants/customers.constants';
import type { CustomerListItem } from '../types/customers.types';

export interface CustomersTableProps {
  data: CustomerListItem[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewCustomer: (customer: CustomerListItem) => void;
}

export function CustomersTable({
  data,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
  onViewCustomer,
}: CustomersTableProps) {
  const columns: ColumnDef<CustomerListItem>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (row: CustomerListItem) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
            {row.name ? row.name.slice(0, 2) : <User className="h-4 w-4" />}
          </div>
          <div className="space-y-0.5">
            <span className="font-semibold text-xs text-foreground block">
              {row.name}
            </span>
            <span className="text-[11px] text-muted-foreground block font-mono">
              {row.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (row: CustomerListItem) => (
        <div className="space-y-0.5 text-xs">
          <div className="text-foreground">{row.email}</div>
          {row.phone && (
            <div className="text-muted-foreground font-mono text-[11px]">
              {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'ordersCount',
      header: 'Orders',
      align: 'center',
      render: (row: CustomerListItem) => (
        <span className="font-semibold text-xs text-foreground">
          {row.ordersCount}
        </span>
      ),
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      align: 'right',
      render: (row: CustomerListItem) => (
        <span className="font-mono text-xs font-bold text-foreground">
          <MoneyText amount={row.totalSpent} />
        </span>
      ),
    },
    {
      key: 'loyaltyPoints',
      header: 'Loyalty Points',
      align: 'center',
      render: (row: CustomerListItem) => (
        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
          {row.loyaltyPoints} pts
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: CustomerListItem) => (
        <StatusBadge
          status={CUSTOMER_STATUS_LABELS[row.status] || row.status}
          variant={CUSTOMER_STATUS_VARIANTS[row.status] || 'neutral'}
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (row: CustomerListItem) => (
        <span className="text-xs text-muted-foreground">
          <DateText date={row.createdAt} />
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row: CustomerListItem) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewCustomer(row)}
          className="h-8 gap-1.5 px-2.5 text-xs"
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Profile</span>
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      total={total}
      page={page}
      limit={limit}
      isLoading={isLoading}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      emptyTitle="No customers found"
      emptyDescription="No customer accounts match your search or filter parameters."
    />
  );
}
