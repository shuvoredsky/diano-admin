'use client';

import { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { PermissionGate } from '@/components/shared/permission-gate';
import { TableSkeleton } from '@/components/feedback/skeletons';
import {
  useApproveStockAuditMutation,
  useInventoryListQuery,
  useRecordAuditCountsMutation,
  useRejectStockAuditMutation,
  useStockAuditByIdQuery,
} from '../hooks/use-inventory-queries';
import type { AuditCountEntryInput } from '../types/inventory.types';

export interface AuditDetailModalProps {
  auditId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailModal({ auditId, isOpen, onClose }: AuditDetailModalProps) {
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // New count row inputs
  const [variantId, setVariantId] = useState('');
  const [countedQuantity, setCountedQuantity] = useState<number>(0);
  const [itemNotes, setItemNotes] = useState('');

  const { data: audit, isLoading, error, refetch } = useStockAuditByIdQuery(auditId || undefined);
  const { data: inventoryData } = useInventoryListQuery({ limit: 100 });

  const recordCountsMutation = useRecordAuditCountsMutation(auditId || '');
  const approveMutation = useApproveStockAuditMutation();
  const rejectMutation = useRejectStockAuditMutation();

  if (!isOpen || !auditId) return null;

  const isInProgress = audit?.status === 'IN_PROGRESS';
  const isApproved = audit?.status === 'APPROVED';
  const isRejected = audit?.status === 'REJECTED';

  const items = audit?.items || [];
  const inventoryItems = inventoryData?.data || [];

  const handleRecordCount = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (!variantId.trim()) {
      setActionError('Please select or enter a variant');
      return;
    }

    const qty = Math.trunc(Number(countedQuantity));
    if (isNaN(qty) || qty < 0) {
      setActionError('Counted quantity must be a non-negative integer');
      return;
    }

    try {
      const entry: AuditCountEntryInput = {
        variantId: variantId.trim(),
        countedQuantity: qty,
        notes: itemNotes.trim() || undefined,
      };

      await recordCountsMutation.mutateAsync([entry]);
      setVariantId('');
      setCountedQuantity(0);
      setItemNotes('');
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to record count');
    }
  };

  const handleApprove = async () => {
    setActionError(null);
    try {
      await approveMutation.mutateAsync(auditId);
      setIsApproveOpen(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve audit');
    }
  };

  const handleReject = async () => {
    setActionError(null);
    try {
      await rejectMutation.mutateAsync({
        auditId,
        reason: rejectReason.trim() || undefined,
      });
      setIsRejectOpen(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject audit');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
        <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Physical Stock Audit</h2>
                  {audit && <StatusBadge status={audit.status} />}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  Audit ID: {audit?.id} • Warehouse: {audit?.warehouse?.name || audit?.warehouseId}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {actionError && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {isLoading ? (
              <TableSkeleton rows={5} columns={4} />
            ) : error ? (
              <div className="p-4 text-center text-sm text-destructive">
                Failed to load audit: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            ) : audit ? (
              <>
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Warehouse Code</span>
                    <p className="font-semibold">{audit.warehouse?.code || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Discrepancies</span>
                    <p className={`font-semibold ${audit.discrepanciesFound > 0 ? 'text-destructive' : 'text-primary'}`}>
                      {audit.discrepanciesFound} items
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Started At</span>
                    <p className="font-semibold">
                      <DateText date={audit.startedAt} />
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completed At</span>
                    <p className="font-semibold">
                      {audit.completedAt ? <DateText date={audit.completedAt} /> : 'In Progress'}
                    </p>
                  </div>
                </div>

                {audit.notes && (
                  <div className="rounded-xl border border-border p-3 text-xs bg-card">
                    <span className="font-semibold text-muted-foreground">Notes: </span>
                    <span>{audit.notes}</span>
                  </div>
                )}

                {/* Record Count Form (only if IN_PROGRESS) */}
                {isInProgress && (
                  <PermissionGate permission="inventory:audit">
                    <div className="rounded-2xl border border-border p-4 bg-muted/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Record Physical Count
                        </h3>
                        <span className="text-2xs text-muted-foreground">
                          Counts update variance automatically
                        </span>
                      </div>

                      <form onSubmit={handleRecordCount} className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
                        <div className="sm:col-span-5">
                          <label className="text-2xs font-semibold text-muted-foreground">Variant</label>
                          <select
                            value={variantId}
                            onChange={(e) => setVariantId(e.target.value)}
                            disabled={recordCountsMutation.isPending}
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-primary focus:outline-hidden"
                          >
                            <option value="">Select a variant to count...</option>
                            {inventoryItems.map((inv) => (
                              <option key={inv.variantId} value={inv.variantId}>
                                {inv.variant?.name || inv.variantId} ({inv.variant?.sku || 'No SKU'}) - On Hand: {inv.onHand}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-2xs font-semibold text-muted-foreground">Counted Quantity</label>
                          <Input
                            type="number"
                            min="0"
                            value={countedQuantity}
                            onChange={(e) => setCountedQuantity(parseInt(e.target.value, 10) || 0)}
                            disabled={recordCountsMutation.isPending}
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-2xs font-semibold text-muted-foreground">Item Note</label>
                          <Input
                            placeholder="e.g. Shelf B4"
                            value={itemNotes}
                            onChange={(e) => setItemNotes(e.target.value)}
                            disabled={recordCountsMutation.isPending}
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={recordCountsMutation.isPending || !variantId}
                            className="h-9 w-full"
                          >
                            {recordCountsMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </PermissionGate>
                )}

                {/* Audit Items Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Count Sheet & Variances ({items.length})</h3>
                  </div>

                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                      No items recorded in this audit session yet. Record physical counts above to calculate variances.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                          <tr>
                            <th className="px-4 py-2.5">Variant / SKU</th>
                            <th className="px-4 py-2.5 text-right">System Qty</th>
                            <th className="px-4 py-2.5 text-right">Counted Qty</th>
                            <th className="px-4 py-2.5 text-right">Variance</th>
                            <th className="px-4 py-2.5">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {items.map((item) => {
                            const isShortage = item.variance < 0;
                            const isSurplus = item.variance > 0;
                            const isBalanced = item.variance === 0;

                            return (
                              <tr key={item.id} className="hover:bg-muted/30">
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-foreground">
                                    {item.variant?.name || item.variantId}
                                  </div>
                                  <div className="font-mono text-2xs text-muted-foreground">
                                    SKU: {item.variant?.sku || '-'}
                                  </div>
                                </td>

                                <td className="px-4 py-3 text-right font-medium">
                                  {item.systemQuantity}
                                </td>

                                <td className="px-4 py-3 text-right font-semibold">
                                  {item.countedQuantity}
                                </td>

                                <td className="px-4 py-3 text-right font-bold">
                                  {isBalanced && (
                                    <span className="text-muted-foreground">0</span>
                                  )}
                                  {isShortage && (
                                    <span className="text-destructive">
                                      {item.variance} (Shortage)
                                    </span>
                                  )}
                                  {isSurplus && (
                                    <span className="text-primary-deep dark:text-primary">
                                      +{item.variance} (Surplus)
                                    </span>
                                  )}
                                </td>

                                <td className="px-4 py-3 text-muted-foreground">
                                  {item.notes || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between border-t border-border p-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>

            {isInProgress && (
              <PermissionGate permission="inventory:audit">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRejectOpen(true)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Reject Audit
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setIsApproveOpen(true)}
                    disabled={
                      approveMutation.isPending ||
                      rejectMutation.isPending ||
                      items.length === 0
                    }
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Approve & Reconcile
                  </Button>
                </div>
              </PermissionGate>
            )}

            {isApproved && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Audit Approved and Ledger Adjustments Applied</span>
              </div>
            )}

            {isRejected && (
              <div className="flex items-center gap-1.5 text-xs text-destructive font-semibold">
                <XCircle className="h-4 w-4" />
                <span>Audit Rejected (No Ledger Adjustments Applied)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        title="Approve Stock Audit & Apply Adjustments?"
        description={
          <div className="space-y-2 text-xs">
            <p>
              Approving this audit will automatically apply ledger adjustment movements for all{' '}
              <strong>{audit?.discrepanciesFound ?? 0} discrepanc{(audit?.discrepanciesFound ?? 0) === 1 ? 'y' : 'ies'}</strong>.
            </p>
            <p className="text-muted-foreground">
              Physical count quantities will become the new on-hand inventory levels. This action is immutable.
            </p>
          </div>
        }
        confirmLabel="Approve & Apply"
        isLoading={approveMutation.isPending}
        onConfirm={handleApprove}
      />

      {/* Reject Confirm Dialog */}
      <ConfirmDialog
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        title="Reject Stock Audit?"
        variant="destructive"
        description={
          <div className="space-y-3 text-xs">
            <p>Are you sure you want to reject this audit session? No adjustments will be made to system stock.</p>
            <div>
              <label className="font-semibold text-muted-foreground">Reason for Rejection (Optional)</label>
              <Input
                placeholder="e.g. Incomplete count / counting procedure error"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        }
        confirmLabel="Reject Audit"
        isLoading={rejectMutation.isPending}
        onConfirm={handleReject}
      />
    </>
  );
}
