'use client';

import { useState } from 'react';
import { Truck, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { MoneyText } from '@/components/shared/money-text';
import { PermissionGate } from '@/components/shared/permission-gate';
import { EmptyState } from '@/components/feedback/empty-state';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { useDeleteMethodMutation } from '../hooks/use-shipping-queries';
import type { ShippingMethodEntity } from '../types/shipping.types';

export interface MethodsTableProps {
  methods: ShippingMethodEntity[];
  isLoading: boolean;
  onEditMethod: (method: ShippingMethodEntity) => void;
  onCreateMethod: () => void;
}

export function MethodsTable({
  methods,
  isLoading,
  onEditMethod,
  onCreateMethod,
}: MethodsTableProps) {
  const [methodToDelete, setMethodToDelete] = useState<ShippingMethodEntity | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useDeleteMethodMutation();

  const handleDeleteConfirm = async () => {
    if (!methodToDelete) return;
    try {
      setDeleteError(null);
      await deleteMutation.mutateAsync(methodToDelete.id);
      setMethodToDelete(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete shipping method';
      setDeleteError(msg);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <EmptyState
        title="No Shipping Methods Configured"
        description="Shipping methods define delivery speed, courier pricing, and free shipping thresholds for each delivery zone."
        action={
          <PermissionGate permission="shipping:manage">
            <Button size="sm" onClick={onCreateMethod} className="gap-1.5">
              <Truck className="h-4 w-4" />
              Add First Method
            </Button>
          </PermissionGate>
        }
      />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Method / Code</th>
              <th className="px-4 py-3">Delivery Zone</th>
              <th className="px-4 py-3 text-right">Base Charge</th>
              <th className="px-4 py-3 text-right">Per Kg Charge</th>
              <th className="px-4 py-3 text-right">Free Shipping Over</th>
              <th className="px-4 py-3">Estimated Days</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {methods.map((method) => (
              <tr
                key={method.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs block">{method.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {method.code}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {method.shippingZone?.name || 'Unassigned'}
                </td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  <MoneyText amount={method.baseCharge} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {Number(method.perKgCharge) > 0 ? (
                    <MoneyText amount={method.perKgCharge} />
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {method.freeShippingThreshold !== null &&
                  method.freeShippingThreshold !== undefined ? (
                    <span className="text-primary font-medium">
                      <MoneyText amount={method.freeShippingThreshold} />
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60">None</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground font-medium">
                  {method.estimatedDays}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={method.isActive ? 'ACTIVE' : 'INACTIVE'}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <PermissionGate permission="shipping:manage">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditMethod(method)}
                        className="h-7 w-7 p-0"
                        title="Edit method"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMethodToDelete(method)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        title="Delete method"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </PermissionGate>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(methodToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setMethodToDelete(null);
            setDeleteError(null);
          }
        }}
        title={`Delete Method "${methodToDelete?.name}"?`}
        description={
          <div className="space-y-2">
            <p>
              Are you sure you want to delete this shipping method? Customers in this zone will no longer see this shipping option at checkout.
            </p>
            {deleteError && (
              <div
                className="rounded-lg bg-destructive/10 p-2.5 text-xs font-medium text-destructive border border-destructive/20"
                role="alert"
              >
                {deleteError}
              </div>
            )}
          </div>
        }
        variant="destructive"
        confirmLabel="Delete Method"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

