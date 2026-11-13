'use client';

import { useState } from 'react';
import {
  useCustomerDetailQuery,
  useCustomerNotesQuery,
  useAddCustomerNoteMutation,
  useUpdateCustomerStatusMutation,
} from '../hooks/use-customers-queries';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { MoneyText } from '@/components/shared/money-text';
import { PermissionGate } from '@/components/shared/permission-gate';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { Skeleton } from '@/components/feedback/skeletons';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUS_VARIANTS,
} from '../constants/customers.constants';
import {
  X,
  User,
  MapPin,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export interface CustomerDetailModalProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailModal({
  customerId,
  isOpen,
  onClose,
}: CustomerDetailModalProps) {
  const [newNote, setNewNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);

  const {
    data: customer,
    isLoading,
    isError,
    error,
    refetch,
  } = useCustomerDetailQuery(isOpen && customerId ? customerId : undefined);

  const { data: notes, refetch: refetchNotes } = useCustomerNotesQuery(
    isOpen && customerId ? customerId : undefined
  );

  const addNoteMutation = useAddCustomerNoteMutation();
  const updateStatusMutation = useUpdateCustomerStatusMutation();

  if (!isOpen) return null;

  const targetStatus = customer?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

  const handleAddNote = async () => {
    if (!customer || !newNote.trim()) return;
    setNoteError(null);
    try {
      await addNoteMutation.mutateAsync({
        id: customer.id,
        input: { note: newNote.trim() },
      });
      setNewNote('');
      refetchNotes();
    } catch (err: unknown) {
      setNoteError(err instanceof Error ? err.message : 'Failed to save customer note');
    }
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    setStatusActionError(null);
    try {
      await updateStatusMutation.mutateAsync({
        id: customer.id,
        input: { status: targetStatus },
      });
      setStatusConfirmOpen(false);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update customer status';
      setStatusActionError(msg);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-foreground">
                  {customer?.name || 'Customer Profile'}
                </h2>
                {customer && (
                  <StatusBadge
                    status={CUSTOMER_STATUS_LABELS[customer.status] || customer.status}
                    variant={CUSTOMER_STATUS_VARIANTS[customer.status] || 'neutral'}
                  />
                )}
              </div>
              {customer?.createdAt && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span>Customer since</span>
                  <DateText date={customer.createdAt} />
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {customer && (
              <PermissionGate permissions={['customer:manage']}>
                <Button
                  variant={customer.status === 'ACTIVE' ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => setStatusConfirmOpen(true)}
                  className="gap-1.5 text-xs font-semibold"
                >
                  {customer.status === 'ACTIVE' ? (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Suspend Customer
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Activate Customer
                    </>
                  )}
                </Button>
              </PermissionGate>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Unable to load customer profile"
              message={error instanceof Error ? error.message : 'An error occurred fetching customer record.'}
              onRetry={() => refetch()}
            />
          ) : customer ? (
            <>
              {statusActionError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{statusActionError}</span>
                </div>
              )}

              {/* Top 2-Column: Personal Profile & Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Card */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <User className="h-4 w-4 text-primary" />
                    Account & Contact
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-semibold text-foreground">{customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-mono text-foreground">{customer.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loyalty Points:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {customer.loyaltyPoints} points
                      </span>
                    </div>
                    {customer.gender && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="capitalize text-foreground">{customer.gender.toLowerCase()}</span>
                      </div>
                    )}
                    {customer.dateOfBirth && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <DateText date={customer.dateOfBirth} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Orders Summary Card */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    Orders & Lifetime Value
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lifetime Spent:</span>
                      <span className="font-bold text-primary-deep dark:text-primary font-mono text-sm">
                        <MoneyText amount={customer.orderSummary?.totalSpent || 0} />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Orders:</span>
                      <span className="font-semibold text-foreground">
                        {customer.orderSummary?.totalOrders || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cancelled Orders:</span>
                      <span className="font-semibold text-destructive">
                        {customer.orderSummary?.cancelledOrders || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Returned Orders:</span>
                      <span className="font-semibold text-warning">
                        {customer.orderSummary?.returnedOrders || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Addresses */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Saved Addresses ({customer.addresses?.length || 0})
                </div>
                {customer.addresses && customer.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customer.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="rounded-xl border border-border bg-muted/10 p-3.5 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{addr.fullName}</span>
                          <div className="flex gap-1.5">
                            {addr.isDefault && (
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                Default
                              </span>
                            )}
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                              {addr.type}
                            </span>
                          </div>
                        </div>
                        <div className="font-mono text-muted-foreground text-[11px]">{addr.phone}</div>
                        <div className="text-foreground">{addr.addressLine}</div>
                        <div className="text-muted-foreground font-medium">
                          {[addr.area, addr.city, addr.district].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No addresses saved.</p>
                )}
              </div>

              {/* Consent & Communication Preferences */}
              {customer.consents && customer.consents.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Consent & Communication Preferences
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {customer.consents.map((consent, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-foreground">{consent.channel}</div>
                          <div className="text-[11px] text-muted-foreground capitalize">
                            {consent.purpose.toLowerCase()}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            consent.isGranted
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {consent.isGranted ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Granted
                            </>
                          ) : (
                            'Opted Out'
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Notes */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Staff Internal Notes ({notes?.length || 0})
                </div>

                {notes && notes.length > 0 ? (
                  <div className="space-y-2">
                    {notes.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-xl border border-border bg-muted/10 p-3 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {n.authorId ? `Staff (${n.authorId.slice(0, 8)})` : 'Staff'}
                          </span>
                          <DateText date={n.createdAt} />
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{n.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No notes recorded yet.</p>
                )}

                <PermissionGate permissions={['customer:manage']}>
                  <div className="rounded-xl border border-border bg-card p-3 space-y-2.5">
                    <h4 className="text-xs font-semibold text-foreground">Add Internal Note</h4>
                    <textarea
                      value={newNote}
                      onChange={(e) => {
                        setNewNote(e.target.value);
                        if (noteError) setNoteError(null);
                      }}
                      placeholder="Add administrative note or customer support observation..."
                      className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        disabled={addNoteMutation.isPending || !newNote.trim()}
                        onClick={handleAddNote}
                      >
                        {addNoteMutation.isPending ? 'Saving...' : 'Add Note'}
                      </Button>
                    </div>
                    {noteError && (
                      <p className="text-[11px] text-destructive font-medium">{noteError}</p>
                    )}
                  </div>
                </PermissionGate>
              </div>
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

      {/* Status Change Confirmation */}
      <ConfirmDialog
        open={statusConfirmOpen}
        onOpenChange={setStatusConfirmOpen}
        title={`${targetStatus === 'SUSPENDED' ? 'Suspend' : 'Activate'} Customer Account`}
        description={
          targetStatus === 'SUSPENDED'
            ? `Are you sure you want to suspend ${customer?.name}? This will prevent the customer from logging in or placing new orders.`
            : `Are you sure you want to reactivate ${customer?.name}'s account? The customer will regain full shopping and login privileges.`
        }
        variant={targetStatus === 'SUSPENDED' ? 'destructive' : 'primary'}
        confirmLabel={targetStatus === 'SUSPENDED' ? 'Suspend Account' : 'Activate Account'}
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleToggleStatus}
      />
    </div>
  );
}
