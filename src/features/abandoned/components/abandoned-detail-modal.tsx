'use client';

import { useState } from 'react';
import { useAbandonedCheckoutDetailQuery, useTriggerRecoveryMutation } from '../hooks/use-abandoned-queries';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { MoneyText } from '@/components/shared/money-text';
import { PermissionGate } from '@/components/shared/permission-gate';
import { Skeleton } from '@/components/feedback/skeletons';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import {
  CHECKOUT_STATUS_LABELS,
  CHECKOUT_STATUS_VARIANTS,
  RECOVERY_CHANNELS,
} from '../constants/abandoned.constants';
import type { NotificationChannel } from '../types/abandoned.types';
import {
  X,
  ShoppingCart,
  User,
  Send,
  Clock,
  History,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export interface AbandonedDetailModalProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AbandonedDetailModal({
  sessionId,
  isOpen,
  onClose,
}: AbandonedDetailModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel>('SMS');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const {
    data: detailData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAbandonedCheckoutDetailQuery(isOpen && sessionId ? sessionId : undefined);

  const triggerRecoveryMutation = useTriggerRecoveryMutation();

  if (!isOpen) return null;

  const session = detailData?.session;

  const handleSendRecovery = async () => {
    if (!session) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await triggerRecoveryMutation.mutateAsync({
        id: session.id || session.sessionId,
        input: { channel: selectedChannel },
      });
      setActionSuccess(res.message || 'Recovery outreach dispatched successfully');
      refetch();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to trigger recovery outreach'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-foreground">
                  {session ? `Checkout #${session.sessionId.slice(0, 12)}` : 'Checkout Details'}
                </h2>
                {session && (
                  <StatusBadge
                    status={CHECKOUT_STATUS_LABELS[session.status] || session.status}
                    variant={CHECKOUT_STATUS_VARIANTS[session.status] || 'neutral'}
                  />
                )}
              </div>
              {session?.createdAt && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span>Started on</span>
                  <DateText date={session.createdAt} />
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Unable to load checkout details"
              message={error instanceof Error ? error.message : 'An error occurred fetching checkout data.'}
              onRetry={() => refetch()}
            />
          ) : session ? (
            <>
              {/* Alert Feedback */}
              {actionError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{actionSuccess}</span>
                </div>
              )}

              {/* Customer Info Card */}
              <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="h-4 w-4 text-primary" />
                  Customer Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Name:</span>
                    <span className="font-semibold text-foreground">
                      {session.customerInfo?.name || 'Anonymous Visitor'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Phone:</span>
                    <span className="font-mono text-foreground">
                      {session.customerInfo?.phone || 'Not provided'}
                    </span>
                  </div>
                  {session.customerInfo?.email && (
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Email:</span>
                      <span className="text-foreground">{session.customerInfo.email}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Device & Browser:</span>
                    <span className="text-foreground capitalize">
                      {session.deviceCategory} {session.browser ? `(${session.browser})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Cart Items ({session.items?.length || 0})
                  </h3>
                </div>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                      <tr>
                        <th className="p-3">Product / SKU</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {session.items?.map((item, idx) => (
                        <tr key={item.variantId || idx} className="hover:bg-muted/10">
                          <td className="p-3">
                            <span className="font-semibold text-foreground block">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {item.sku}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-muted-foreground">
                            <MoneyText amount={item.price} />
                          </td>
                          <td className="p-3 text-center font-bold text-foreground">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold text-foreground">
                            <MoneyText amount={item.lineTotal} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="flex justify-end pt-1">
                  <div className="rounded-xl border border-border bg-card p-3 text-xs font-bold text-foreground flex items-center gap-4">
                    <span className="text-muted-foreground uppercase text-[11px]">Total Value:</span>
                    <span className="text-sm font-black text-primary-deep dark:text-primary">
                      <MoneyText amount={session.checkoutValue} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Recovery Outreach Section */}
              <PermissionGate permissions={['abandoned_checkout:manage']}>
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <Send className="h-4 w-4 text-primary" />
                    Recovery Outreach
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dispatch an automated recovery notification with a direct checkout restore link to the customer.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value as NotificationChannel)}
                      aria-label="Select notification channel"
                      className="h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
                    >
                      {RECOVERY_CHANNELS.map((ch) => (
                        <option key={ch.value} value={ch.value}>
                          {ch.label}
                        </option>
                      ))}
                    </select>

                    <Button
                      type="button"
                      size="sm"
                      disabled={triggerRecoveryMutation.isPending}
                      onClick={handleSendRecovery}
                      className="gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {triggerRecoveryMutation.isPending ? 'Sending...' : 'Send Recovery Message'}
                    </Button>
                  </div>
                </div>
              </PermissionGate>

              {/* Recovery History */}
              {session.recoveryAttempts && session.recoveryAttempts.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <History className="h-4 w-4 text-primary" />
                    Outreach History ({session.recoveryAttempts.length})
                  </div>
                  <div className="space-y-2">
                    {session.recoveryAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-muted/10 p-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground uppercase text-[11px] rounded bg-muted px-1.5 py-0.5">
                            {attempt.channel}
                          </span>
                          <span className="text-muted-foreground">
                            Status: <span className="font-medium text-foreground">{attempt.status}</span>
                          </span>
                        </div>
                        <DateText date={attempt.sentAt} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Events */}
              {session.events && session.events.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    Session Events Log
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {session.events.map((evt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/10"
                      >
                        <span className="font-mono text-[11px] text-foreground font-medium">
                          {evt.type}
                        </span>
                        <DateText date={evt.occurredAt} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border bg-muted/20 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
