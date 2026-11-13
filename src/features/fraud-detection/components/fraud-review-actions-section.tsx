'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  KeyRound,
  AlertCircle,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { PermissionGate } from '@/components/shared/permission-gate';
import {
  useApproveFraudReviewMutation,
  useRejectFraudReviewMutation,
  useRequestFraudOtpMutation,
  useVerifyFraudOtpMutation,
} from '../hooks/use-fraud-queries';
import type { FraudReviewDetailEntity } from '../types/fraud.types';

export interface FraudReviewActionsSectionProps {
  review: FraudReviewDetailEntity;
  onSuccess?: () => void;
}

export function FraudReviewActionsSection({
  review,
  onSuccess,
}: FraudReviewActionsSectionProps) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [isFalsePositive, setIsFalsePositive] = useState(false);
  const [approveNote, setApproveNote] = useState('');

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const [otpCode, setOtpCode] = useState('');
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const approveMutation = useApproveFraudReviewMutation();
  const rejectMutation = useRejectFraudReviewMutation();
  const requestOtpMutation = useRequestFraudOtpMutation();
  const verifyOtpMutation = useVerifyFraudOtpMutation();

  const isResolved =
    review.reviewStatus === 'APPROVED' || review.reviewStatus === 'REJECTED';

  const handleApprove = async () => {
    setActionError(null);
    try {
      await approveMutation.mutateAsync({
        id: review.id,
        input: {
          isFalsePositive,
          note: approveNote.trim() || undefined,
        },
      });
      setApproveOpen(false);
      setIsFalsePositive(false);
      setApproveNote('');
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve review';
      setActionError(msg);
      throw err;
    }
  };

  const handleReject = async () => {
    setActionError(null);
    if (rejectReason.trim().length < 3) {
      setRejectError('A detailed rejection reason is required (min 3 characters).');
      return;
    }
    setRejectError(null);

    try {
      await rejectMutation.mutateAsync({
        id: review.id,
        input: { reason: rejectReason.trim() },
      });
      setRejectOpen(false);
      setRejectReason('');
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject review';
      setActionError(msg);
      throw err;
    }
  };

  const handleRequestOtp = async () => {
    setActionError(null);
    setOtpMessage(null);
    try {
      const res = await requestOtpMutation.mutateAsync(review.id);
      setOtpMessage(res.message || 'OTP verification SMS dispatched to customer phone.');
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      setActionError(msg);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setActionError('OTP must be exactly 6 numeric digits');
      return;
    }
    setActionError(null);
    try {
      await verifyOtpMutation.mutateAsync({
        id: review.id,
        input: { code: otpCode.trim() },
      });
      setOtpCode('');
      setOtpMessage('Customer OTP verified successfully. Review status updated.');
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired OTP code';
      setActionError(msg);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
        Staff Review Decision & Actions
      </h4>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {otpMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-700">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{otpMessage}</span>
        </div>
      )}

      {isResolved ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          This order assessment has already been resolved with status:{' '}
          <strong className="text-foreground">{review.reviewStatus}</strong>.
        </div>
      ) : (
        <PermissionGate
          permissions={['fraud:review', 'fraud:manage']}
          fallback={
            <p className="text-[11px] text-muted-foreground italic">
              You do not have permission to approve, reject, or request OTP for fraud reviews (`fraud:review` required).
            </p>
          }
        >
          <div className="space-y-3">
            {/* Primary Decision Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={() => setApproveOpen(true)}
                className="gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Order (Clear Hold)
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() => setRejectOpen(true)}
                className="gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                Reject & Cancel Order
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={requestOtpMutation.isPending}
                onClick={handleRequestOtp}
                className="gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                {requestOtpMutation.isPending ? 'Sending...' : 'Request Customer OTP'}
              </Button>
            </div>

            {/* OTP Verification Input if OTP was requested */}
            {review.reviewStatus === 'OTP_REQUESTED' && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-primary" />
                  Verify Customer OTP (6 Digits)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-36 rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-sm tracking-widest text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={otpCode.length !== 6 || verifyOtpMutation.isPending}
                    onClick={handleVerifyOtp}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PermissionGate>
      )}

      {/* Decision History */}
      {review.decisionHistory && review.decisionHistory.length > 0 && (
        <div className="pt-2 border-t border-border space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Decision Audit Trail ({review.decisionHistory.length})
          </span>
          <div className="space-y-1.5 text-xs">
            {review.decisionHistory.map((item) => (
              <div key={item.id} className="rounded-md bg-muted/30 p-2 space-y-0.5">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-foreground">{item.decision}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString('en-BD')}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve Held Order"
        description={
          <div className="space-y-3 text-xs text-foreground">
            <p>
              Approving this order will clear the fraud hold and allow the fulfillment team to confirm and process Order #{review.order?.orderNumber || review.orderId}.
            </p>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
              <input
                type="checkbox"
                checked={isFalsePositive}
                onChange={(e) => setIsFalsePositive(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Mark as False Positive (Used to calibrate risk engine and lower future false alarms)
            </label>
            <div>
              <label htmlFor="approve-note" className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Staff Note (Optional):
              </label>
              <textarea
                id="approve-note"
                rows={2}
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="e.g. Spoke to customer via phone; address verified."
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        }
        confirmLabel={approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
        onConfirm={handleApprove}
        isLoading={approveMutation.isPending}
      />

      {/* Confirm Reject Dialog */}
      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) setRejectError(null);
        }}
        title="Reject Review & Cancel Order"
        description={
          <div className="space-y-3 text-xs text-foreground">
            <p className="text-destructive font-medium">
              Warning: Confirming rejection will mark this review as REJECTED and automatically transition Order #{review.order?.orderNumber || review.orderId} to CANCELLED.
            </p>
            <div>
              <label htmlFor="reject-reason" className="block text-[11px] font-semibold text-foreground mb-1">
                Detailed Rejection Reason (Required, min 3 chars):
              </label>
              <textarea
                id="reject-reason"
                rows={2}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError && e.target.value.trim().length >= 3) {
                    setRejectError(null);
                  }
                }}
                placeholder="e.g. Unreachable phone number and flagged suspicious shipping address"
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-destructive"
              />
              {rejectError && (
                <p className="text-[11px] text-destructive mt-1">{rejectError}</p>
              )}
            </div>
          </div>
        }
        confirmLabel={rejectMutation.isPending ? 'Rejecting...' : 'Reject & Cancel Order'}
        onConfirm={handleReject}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
