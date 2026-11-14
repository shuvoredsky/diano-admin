'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, PackageCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useReviewReturnMutation } from '../hooks/use-returns-queries';
import { ReturnInspectModal } from './return-inspect-modal';
import type { ReturnRequestEntity } from '../types/returns.types';

export interface ReturnActionsSectionProps {
  returnRequest: ReturnRequestEntity;
  onSuccess?: () => void;
}

export function ReturnActionsSection({
  returnRequest,
  onSuccess,
}: ReturnActionsSectionProps) {
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [staffNote, setStaffNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const reviewMutation = useReviewReturnMutation();

  const handleApprove = async () => {
    try {
      await reviewMutation.mutateAsync({
        id: returnRequest.id,
        input: {
          action: 'APPROVE',
          staffNote: staffNote.trim() || undefined,
        },
      });
      setIsApproveOpen(false);
      setStaffNote('');
      onSuccess?.();
    } catch {
      // Handled by toast
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setFormError('A rejection reason is required (e.g. Return window expired, ineligible product)');
      throw new Error('A rejection reason is required');
    }
    setFormError(null);
    try {
      await reviewMutation.mutateAsync({
        id: returnRequest.id,
        input: {
          action: 'REJECT',
          staffNote: rejectReason.trim(),
        },
      });
      setIsRejectOpen(false);
      setRejectReason('');
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject return';
      setFormError(msg);
      throw err;
    }
  };

  const isRequested = returnRequest.status === 'REQUESTED';
  const isApproved = returnRequest.status === 'APPROVED' || returnRequest.status === 'ITEM_RECEIVED';
  const isInspected = returnRequest.status === 'INSPECTED' || returnRequest.status === 'RECEIVED';
  const isCompleted =
    returnRequest.status === 'REFUNDED' ||
    returnRequest.status === 'REPLACED' ||
    returnRequest.status === 'REJECTED' ||
    returnRequest.status === 'CANCELLED';

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
        Operational Actions & Decisions
      </h4>

      {isRequested && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Customer requested this return. Review item photos/reasons, then approve for warehouse return or reject with an explanation.
          </p>
          <PermissionGate
            permission="return:manage"
            fallback={
              <p className="text-[11px] text-muted-foreground italic">
                You do not have permission to review returns (`return:manage` required).
              </p>
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setIsApproveOpen(true)}
                className="gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Return Request
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setRejectReason('');
                  setFormError(null);
                  setIsRejectOpen(true);
                }}
                className="gap-1.5 cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                Reject Return Request
              </Button>
            </div>
          </PermissionGate>
        </div>
      )}

      {isApproved && (
        <div className="space-y-3">
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-primary-foreground">
            <p className="font-semibold text-foreground">Return Approved — Awaiting Inbound Package</p>
            <p className="text-[11px] text-muted-foreground pt-0.5">
              Once courier delivers the return package to your warehouse, inspect the contents and record condition.
            </p>
          </div>
          <PermissionGate permission="return:manage">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsInspectOpen(true)}
              className="gap-1.5 cursor-pointer"
            >
              <PackageCheck className="h-4 w-4" />
              Receive & Inspect Items
            </Button>
          </PermissionGate>
        </div>
      )}

      {isInspected && (
        <div className="rounded-lg border border-warning/20 bg-warning/10 p-3 text-xs text-warning-foreground space-y-1">
          <p className="font-semibold text-foreground">Items Inspected</p>
          <p className="text-[11px] opacity-90">
            Inspection complete. To disburse funds back to customer, proceed to the <strong>Refunds</strong> management tab.
          </p>
        </div>
      )}

      {isCompleted && (
        <p className="text-xs text-muted-foreground italic">
          This return request is in terminal status ({returnRequest.status}). No further actions required.
        </p>
      )}

      {/* Approve Dialog */}
      <ConfirmDialog
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        title={`Approve Return #${returnRequest.returnNumber}?`}
        description={
          <div className="space-y-2 pt-2 text-xs text-muted-foreground">
            <p>
              Approving this return instructs the customer to send items back to your return facility.
            </p>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">
                Staff Note (Optional)
              </label>
              <textarea
                value={staffNote}
                onChange={(e) => setStaffNote(e.target.value)}
                placeholder="Optional instructions for receiving staff..."
                rows={2}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        }
        confirmLabel="Approve Return"
        isLoading={reviewMutation.isPending}
        onConfirm={handleApprove}
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        open={isRejectOpen}
        onOpenChange={(open) => {
          setIsRejectOpen(open);
          if (!open) setFormError(null);
        }}
        title={`Reject Return #${returnRequest.returnNumber}?`}
        description={
          <div className="space-y-2 pt-2 text-xs text-muted-foreground">
            <p>
              Are you sure you want to reject this return? Please provide a clear explanation for the customer.
            </p>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">
                Rejection Reason <span className="text-destructive">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Enter mandatory rejection reason..."
                rows={3}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:ring-1 focus:ring-primary"
                required
              />
              {formError && (
                <div className="flex items-center gap-1.5 text-[11px] text-destructive font-medium pt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{formError}</span>
                </div>
              )}
            </div>
          </div>
        }
        variant="destructive"
        confirmLabel="Reject Return"
        isLoading={reviewMutation.isPending}
        onConfirm={handleReject}
      />

      {/* Inspect Modal */}
      <ReturnInspectModal
        isOpen={isInspectOpen}
        onClose={() => setIsInspectOpen(false)}
        returnRequest={returnRequest}
        onSuccess={onSuccess}
      />
    </div>
  );
}

