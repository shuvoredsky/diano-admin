'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/shared/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { useAuditLogsQuery } from '../hooks/use-audit-logs-queries';
import { AuditLogsFilterBar } from './audit-logs-filter-bar';
import { AuditLogsTable } from './audit-logs-table';
import { AuditLogDetailModal } from './audit-log-detail-modal';
import type { AuditLogEntry, AuditLogFilterParams } from '../types/audit-logs.types';

export function AuditLogsManager() {
  const [filters, setFilters] = useState<AuditLogFilterParams>({
    page: 1,
    limit: 20,
    sortOrder: 'desc',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const { data, isLoading } = useAuditLogsQuery(filters);

  const handleFilterChange = (updates: Partial<AuditLogFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortOrder: 'desc',
    });
  };

  const totalPages = data?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;

  return (
    <PermissionGate
      permission={PERMISSIONS.AUDIT_VIEW}
      fallback={
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center">
          <ShieldAlert className="h-10 w-10 text-destructive mb-3" />
          <h2 className="text-sm font-bold text-foreground">Access Restricted</h2>
          <p className="mt-1 text-xs text-muted-foreground max-w-md">
            You require the <code className="font-mono text-destructive">audit:view</code> permission to inspect system audit trails and security event logs.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Audit Logs & Security Events
          </h1>
          <p className="text-xs text-muted-foreground">
            Immutable, append-only audit trail of administrative actions, authentication attempts, and security modifications.
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-1.5 self-start rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Append-Only Immutability Active</span>
        </div>
      </div>

      {/* Filter Bar */}
      <AuditLogsFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Logs Table */}
      <AuditLogsTable
        logs={data?.items ?? []}
        isLoading={isLoading}
        onViewDetail={(log) => setSelectedLog(log)}
      />

      {/* Pagination Bar */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div>
            Showing {(currentPage - 1) * (filters.limit ?? 20) + 1} to{' '}
            {Math.min(currentPage * (filters.limit ?? 20), data.total)} of{' '}
            <span className="font-semibold text-foreground">{data.total}</span> events
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => handleFilterChange({ page: currentPage - 1 })}
              className="h-8 gap-1 rounded-xl px-2.5 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <span className="text-xs font-medium text-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => handleFilterChange({ page: currentPage + 1 })}
              className="h-8 gap-1 rounded-xl px-2.5 text-xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Inspect Detail Modal */}
      <AuditLogDetailModal
        log={selectedLog}
        open={Boolean(selectedLog)}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
    </PermissionGate>
  );
}
