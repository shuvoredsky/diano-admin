'use client';

import { Search, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StaffFilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  role: string;
  onRoleChange: (role: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  rolesList?: Array<{ slug: string; name: string }>;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function StaffFilterBar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  rolesList = [],
  onRefresh,
  isLoading = false,
}: StaffFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs">
      <div className="flex items-center gap-2 flex-1 min-w-[220px]">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <select
          aria-label="Filter by role"
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
        >
          <option value="">All Roles</option>
          {rolesList.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <select
        aria-label="Filter by status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="SUSPENDED">Suspended</option>
        <option value="INACTIVE">Inactive</option>
        <option value="PENDING_VERIFICATION">Pending</option>
      </select>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="h-8 gap-1.5 text-xs"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </Button>
    </div>
  );
}
