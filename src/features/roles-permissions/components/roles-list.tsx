'use client';

import { useState } from 'react';
import { Shield, Edit2, Trash2, Key, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { useAuthPermissions } from '@/features/auth/hooks';
import { PERMISSIONS } from '@/constants/permissions';
import { useDeleteRoleMutation } from '../hooks/use-roles-queries';
import type { RoleSummaryItem } from '../types/roles.types';

export interface RolesListProps {
  roles: RoleSummaryItem[];
  selectedRoleId: string | null;
  onSelectRole: (role: RoleSummaryItem) => void;
  onEditRole: (role: RoleSummaryItem) => void;
  isLoading: boolean;
}

export function RolesList({
  roles,
  selectedRoleId,
  onSelectRole,
  onEditRole,
  isLoading,
}: RolesListProps) {
  const { hasPermission } = useAuthPermissions();
  const canUpdate = hasPermission(PERMISSIONS.ROLE_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ROLE_DELETE);

  const [roleToDelete, setRoleToDelete] = useState<RoleSummaryItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteMutation = useDeleteRoleMutation();

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(roleToDelete.id);
      setRoleToDelete(null);
    } catch (err: unknown) {
      let msg = 'Failed to delete role';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setDeleteError(msg);
      throw err;
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Configured Roles ({roles.length})
            </h3>
          </div>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading role hierarchy...</div>
          ) : roles.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">No roles configured.</div>
          ) : (
            roles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              const isSystem = role.isSystem || role.slug.toLowerCase() === 'super-admin';

              return (
                <div
                  key={role.id}
                  onClick={() => onSelectRole(role)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{role.name}</span>
                      {isSystem ? (
                        <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.2 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                          SYSTEM
                        </span>
                      ) : (
                        <span className="rounded-md border border-border bg-muted/50 px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                          CUSTOM
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">slug: {role.slug}</p>
                    {role.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{role.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Key className="h-3 w-3 text-primary" />
                      <span>{role.permissionsCount} permissions</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isSystem}
                          onClick={() => onEditRole(role)}
                          title={isSystem ? 'System roles cannot be modified' : 'Edit role details'}
                          className="h-7 w-7 p-0 disabled:opacity-30"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isSystem}
                          onClick={() => {
                            setDeleteError(null);
                            setRoleToDelete(role);
                          }}
                          title={isSystem ? 'System roles cannot be deleted' : 'Delete custom role'}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive disabled:opacity-30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(roleToDelete)}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
        title={`Delete Role: ${roleToDelete?.name}`}
        description={
          deleteError ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-destructive font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            </div>
          ) : (
            `Are you sure you want to delete the role [${roleToDelete?.name}]? This action cannot be undone.`
          )
        }
        confirmLabel="Delete Role"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
