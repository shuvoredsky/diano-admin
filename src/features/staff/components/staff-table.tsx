'use client';

import { useState } from 'react';
import { Edit2, ShieldAlert, LogOut, UserX, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { useAuthPermissions } from '@/features/auth/hooks';
import { PERMISSIONS } from '@/constants/permissions';
import {
  useUpdateStaffStatusMutation,
  useDeleteStaffMutation,
  useRevokeStaffSessionsMutation,
} from '../hooks/use-staff-queries';
import type { StaffUser } from '../types/staff.types';

export interface StaffTableProps {
  data: StaffUser[];
  isLoading: boolean;
  onEdit: (user: StaffUser) => void;
}

export function StaffTable({ data, isLoading, onEdit }: StaffTableProps) {
  const { hasPermission } = useAuthPermissions();
  const canUpdate = hasPermission(PERMISSIONS.USER_UPDATE);
  const canManage = hasPermission(PERMISSIONS.USER_MANAGE);
  const canDelete = hasPermission(PERMISSIONS.USER_DELETE);

  const [statusTarget, setStatusTarget] = useState<{ user: StaffUser; newStatus: 'ACTIVE' | 'SUSPENDED' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<StaffUser | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const statusMutation = useUpdateStaffStatusMutation();
  const deleteMutation = useDeleteStaffMutation();
  const revokeMutation = useRevokeStaffSessionsMutation();

  const handleStatusConfirm = async () => {
    if (!statusTarget) return;
    setDialogError(null);
    try {
      await statusMutation.mutateAsync({
        id: statusTarget.user.id,
        status: statusTarget.newStatus,
      });
      setStatusTarget(null);
    } catch (err: unknown) {
      let msg = 'Failed to update account status';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setDialogError(msg);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDialogError(null);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: unknown) {
      let msg = 'Failed to deactivate account';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setDialogError(msg);
      throw err;
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return;
    setDialogError(null);
    try {
      await revokeMutation.mutateAsync(revokeTarget.id);
      setRevokeTarget(null);
    } catch (err: unknown) {
      let msg = 'Failed to revoke user sessions';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setDialogError(msg);
      throw err;
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Member Since</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading staff members...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No staff accounts found.
                  </td>
                </tr>
              ) : (
                data.map((user) => {
                  const primaryRole = user.roles[0];
                  const isSuperAdmin = user.roles.some(
                    (r) => r.slug.toLowerCase() === 'super-admin'
                  );

                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isSuperAdmin && (
                                <span className="rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1 py-0.2 text-[9px] font-bold">
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        {user.phone || '—'}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-lg border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                          {primaryRole?.name || 'No Role'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={user.status} />
                      </td>

                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <DateText date={user.createdAt} format="date" />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(user)}
                              title="Edit user details"
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {canManage && (
                            <>
                              {user.status === 'ACTIVE' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDialogError(null);
                                    setStatusTarget({ user, newStatus: 'SUSPENDED' });
                                  }}
                                  title="Suspend account"
                                  className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700"
                                >
                                  <UserX className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDialogError(null);
                                    setStatusTarget({ user, newStatus: 'ACTIVE' });
                                  }}
                                  title="Activate account"
                                  className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                                >
                                  <UserCheck className="h-3.5 w-3.5" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDialogError(null);
                                  setRevokeTarget(user);
                                }}
                                title="Revoke all active sessions"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <LogOut className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}

                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDialogError(null);
                                setDeleteTarget(user);
                              }}
                              title="Deactivate account"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend / Activate ConfirmDialog */}
      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={statusTarget?.newStatus === 'SUSPENDED' ? 'Suspend Staff Account' : 'Reactivate Staff Account'}
        description={
          dialogError ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-destructive font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{dialogError}</span>
              </div>
            </div>
          ) : (
            `Are you sure you want to ${statusTarget?.newStatus === 'SUSPENDED' ? 'suspend' : 'reactivate'} ${statusTarget?.user.name}'s account?`
          )
        }
        confirmLabel={statusTarget?.newStatus === 'SUSPENDED' ? 'Suspend Account' : 'Reactivate Account'}
        variant={statusTarget?.newStatus === 'SUSPENDED' ? 'destructive' : 'primary'}
        isLoading={statusMutation.isPending}
        onConfirm={handleStatusConfirm}
      />

      {/* Delete / Deactivate ConfirmDialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Deactivate Staff Account"
        description={
          dialogError ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-destructive font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{dialogError}</span>
              </div>
            </div>
          ) : (
            `Are you sure you want to deactivate ${deleteTarget?.name}? All their active sessions will be terminated immediately.`
          )
        }
        confirmLabel="Deactivate Account"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      {/* Revoke Sessions ConfirmDialog */}
      <ConfirmDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Terminate User Sessions"
        description={
          dialogError ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-destructive font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{dialogError}</span>
              </div>
            </div>
          ) : (
            `Are you sure you want to forcefully revoke all active login sessions for ${revokeTarget?.name}?`
          )
        }
        confirmLabel="Revoke Sessions"
        variant="destructive"
        isLoading={revokeMutation.isPending}
        onConfirm={handleRevokeConfirm}
      />
    </>
  );
}
