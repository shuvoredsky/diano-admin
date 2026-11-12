'use client';

import { useState } from 'react';
import { Edit2, Trash2, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useDeleteSupplierMutation } from '../hooks/use-suppliers-queries';
import type { SupplierEntity } from '../types/suppliers.types';
import { SupplierFormModal } from './supplier-form-modal';

export interface SuppliersTableProps {
  data: SupplierEntity[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function SuppliersTable({
  data,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
}: SuppliersTableProps) {
  const [editingSupplier, setEditingSupplier] = useState<SupplierEntity | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<SupplierEntity | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteMutation = useDeleteSupplierMutation();

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(deletingSupplier.id);
      setDeletingSupplier(null);
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Cannot delete supplier. They may be linked to active purchase orders.'
      );
    }
  };

  const columns: ColumnDef<SupplierEntity & Record<string, unknown>>[] = [
    {
      key: 'name',
      header: 'Supplier',
      render: row => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">{row.name}</div>
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            {row.code}
          </span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Person',
      render: row => (
        <div className="text-xs text-foreground">
          {row.contactPerson || <span className="text-muted-foreground italic">Not specified</span>}
        </div>
      ),
    },
    {
      key: 'contactInfo',
      header: 'Phone & Email',
      render: row => (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          {row.phone && (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-foreground">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{row.phone}</span>
            </div>
          )}
          {row.email && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span>{row.email}</span>
            </div>
          )}
          {!row.phone && !row.email && <span>—</span>}
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: row => (
        <div className="text-xs text-muted-foreground max-w-xs truncate" title={row.address || ''}>
          {row.address ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{row.address}</span>
            </span>
          ) : (
            '—'
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: row => (
        <StatusBadge
          status={row.isActive ? 'active' : 'inactive'}
          variant={row.isActive ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'orders',
      header: 'Purchase Orders',
      render: row => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row._count?.purchaseOrders ?? 0}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: row => (
        <PermissionGate permissions={['supplier:manage']}>
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setEditingSupplier(row)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Edit Supplier"
              aria-label={`Edit ${row.name}`}
            >
              <Edit2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setDeletingSupplier(row);
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Delete Supplier"
              aria-label={`Delete ${row.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </PermissionGate>
      ),
    },
  ];

  return (
    <>
      {deleteError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      <DataTable
        data={data as (SupplierEntity & Record<string, unknown>)[]}
        columns={columns}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyTitle="No suppliers found"
        emptyDescription="Add vendors and manufacturing suppliers to place purchase orders."
      />

      {editingSupplier && (
        <SupplierFormModal
          supplier={editingSupplier}
          isOpen={Boolean(editingSupplier)}
          onClose={() => setEditingSupplier(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deletingSupplier)}
        onOpenChange={open => !open && setDeletingSupplier(null)}
        title="Delete Supplier"
        description={
          <div>
            Are you sure you want to delete supplier{' '}
            <strong className="text-foreground">{deletingSupplier?.name}</strong>?
            This will soft-delete the vendor profile and set them to inactive.
          </div>
        }
        confirmLabel="Delete Supplier"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

