'use client';

import { useState } from 'react';
import { ClipboardCheck, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { PermissionGate } from '@/components/shared/permission-gate';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { useStockAuditsQuery } from '../hooks/use-inventory-queries';
import { StartAuditModal } from './start-audit-modal';
import { AuditDetailModal } from './audit-detail-modal';

export function StockAuditList() {
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  const { data: audits, isLoading, error, refetch } = useStockAuditsQuery();

  const auditList = audits || [];

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">Physical Stock Audits</h3>
          <p className="text-xs text-muted-foreground">
            Conduct inventory cycle counts, compare physical vs system stock, and reconcile variances
          </p>
        </div>

        <PermissionGate permission="inventory:audit">
          <Button onClick={() => setIsStartModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Start New Audit</span>
          </Button>
        </PermissionGate>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : error ? (
        <ErrorState
          title="Failed to load stock audits"
          message={error instanceof Error ? error.message : 'Error fetching audits'}
          onRetry={() => refetch()}
        />
      ) : auditList.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-7 w-7" />}
          title="No stock audits found"
          description="Initiate a physical stock count session to track inventory discrepancies and adjust stock."
          action={
            <PermissionGate permission="inventory:audit">
              <Button onClick={() => setIsStartModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Start First Audit
              </Button>
            </PermissionGate>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Audit ID</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Discrepancies</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditList.map((audit) => (
                <tr key={audit.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-medium text-foreground">
                    #{audit.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">
                      {audit.warehouse?.name || audit.warehouseId}
                    </div>
                    {audit.warehouse?.code && (
                      <div className="text-2xs text-muted-foreground font-mono">
                        {audit.warehouse.code}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={audit.status} />
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">
                    <span
                      className={
                        audit.discrepanciesFound > 0
                          ? 'text-destructive font-bold'
                          : 'text-muted-foreground'
                      }
                    >
                      {audit.discrepanciesFound}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <DateText date={audit.startedAt} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {audit.completedAt ? <DateText date={audit.completedAt} /> : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAuditId(audit.id)}
                      className="gap-1.5 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{audit.status === 'IN_PROGRESS' ? 'Record / Review' : 'View Details'}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <StartAuditModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <AuditDetailModal
        auditId={selectedAuditId}
        isOpen={Boolean(selectedAuditId)}
        onClose={() => setSelectedAuditId(null)}
      />
    </div>
  );
}
