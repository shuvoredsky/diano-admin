'use client';

import { useState, useEffect, useMemo } from 'react';
import { Shield, Save, AlertTriangle, AlertCircle, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { useAuthPermissions } from '@/features/auth/hooks';
import { PERMISSIONS } from '@/constants/permissions';
import {
  useRoleDetailQuery,
  usePermissionsCatalogQuery,
  useAssignPermissionsMutation,
} from '../hooks/use-roles-queries';
import type { RoleSummaryItem } from '../types/roles.types';
import { ModulePermissionSection } from './module-permission-section';

export interface PermissionsMatrixProps {
  role: RoleSummaryItem | null;
}

export function PermissionsMatrix({ role }: PermissionsMatrixProps) {
  const { user, isSuperAdmin, hasPermission } = useAuthPermissions();
  const canUpdate = hasPermission(PERMISSIONS.ROLE_UPDATE) || isSuperAdmin;

  const { data: roleDetail, isLoading: roleLoading } = useRoleDetailQuery(role?.id);
  const { data: catalog, isLoading: catalogLoading } = usePermissionsCatalogQuery();
  const assignMutation = useAssignPermissionsMutation();

  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isRoleSuperAdmin = role?.slug.toLowerCase() === 'super-admin';
  const isEditingOwnRole = Boolean(
    user?.roles?.some((r) => r.toLowerCase() === role?.slug.toLowerCase())
  );

  // Sync initial permissions from role detail
  useEffect(() => {
    if (roleDetail?.permissions) {
      setSelectedSlugs(new Set(roleDetail.permissions.map((p) => p.slug)));
    } else {
      setSelectedSlugs(new Set());
    }
    setSaveError(null);
  }, [roleDetail]);

  const initialSlugs = useMemo(() => {
    return new Set(roleDetail?.permissions.map((p) => p.slug) ?? []);
  }, [roleDetail]);

  const addedPermissions = useMemo(() => {
    return Array.from(selectedSlugs).filter((s) => !initialSlugs.has(s));
  }, [selectedSlugs, initialSlugs]);

  const removedPermissions = useMemo(() => {
    return Array.from(initialSlugs).filter((s) => !selectedSlugs.has(s));
  }, [selectedSlugs, initialSlugs]);

  const hasChanges = addedPermissions.length > 0 || removedPermissions.length > 0;

  if (!role) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
        Select a role from the list to view and configure its permissions matrix.
      </div>
    );
  }

  const handleToggleSlug = (slug: string) => {
    if (isRoleSuperAdmin || !canUpdate) return;
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const handleSelectModuleAll = (slugs: string[], select: boolean) => {
    if (isRoleSuperAdmin || !canUpdate) return;
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      for (const s of slugs) {
        if (select) {
          next.add(s);
        } else {
          next.delete(s);
        }
      }
      return next;
    });
  };

  const handleSaveConfirm = async () => {
    if (!role) return;
    setSaveError(null);
    try {
      await assignMutation.mutateAsync({
        id: role.id,
        input: { permissionSlugs: Array.from(selectedSlugs) },
      });
      setShowConfirm(false);
    } catch (err: unknown) {
      let msg = 'Failed to update role permissions';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setSaveError(msg);
      throw err;
    }
  };

  const modules = Object.entries(catalog ?? {});

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Permissions Matrix: {role.name}
            </h3>
            {isRoleSuperAdmin && (
              <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                INHERENT ROOT ACCESS
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isRoleSuperAdmin
              ? 'Super Administrator inherently possesses all permissions and cannot be modified.'
              : `Selected ${selectedSlugs.size} active privileges across system modules.`}
          </p>
        </div>

        {!isRoleSuperAdmin && canUpdate && (
          <Button
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={!hasChanges || assignMutation.isPending}
            className="h-8 gap-1.5 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Permissions</span>
          </Button>
        )}
      </div>

      {/* Own role warning */}
      {isEditingOwnRole && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>Warning:</strong> You are editing your currently assigned role. Removing privileges may immediately restrict your navigation access upon saving.
          </span>
        </div>
      )}

      {/* Permissions Module Grid */}
      <div className="space-y-4">
        {roleLoading || catalogLoading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
            Loading permissions matrix...
          </div>
        ) : (
          modules.map(([resource, perms]) => (
            <ModulePermissionSection
              key={resource}
              moduleName={`${resource.replace(/_/g, ' ')} Module`}
              perms={perms}
              selectedSlugs={selectedSlugs}
              isRoleSuperAdmin={isRoleSuperAdmin}
              canUpdate={canUpdate}
              onToggleSlug={handleToggleSlug}
              onSelectAll={handleSelectModuleAll}
            />
          ))
        )}
      </div>

      {/* Confirmation Dialog with Permission Diff & Self-Lockout Warning */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={(open) => !open && setShowConfirm(false)}
        title="Confirm Permission Changes"
        description={
          <div className="space-y-3 pt-1">
            {saveError && (
              <div className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {isEditingOwnRole && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Self-Lockout Warning:</strong> You are modifying permissions on your own role. Removing vital privileges may immediately restrict your administrative dashboard access.
                </span>
              </div>
            )}

            <div className="space-y-2 text-xs text-muted-foreground">
              {addedPermissions.length > 0 && (
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Adding ({addedPermissions.length}):
                  </span>
                  <div className="mt-1 max-h-24 overflow-y-auto space-y-0.5 pl-2 font-mono text-[11px]">
                    {addedPermissions.map((s) => (
                      <div key={s} className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Plus className="h-3 w-3" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {removedPermissions.length > 0 && (
                <div>
                  <span className="font-bold text-destructive">
                    Removing ({removedPermissions.length}):
                  </span>
                  <div className="mt-1 max-h-24 overflow-y-auto space-y-0.5 pl-2 font-mono text-[11px]">
                    {removedPermissions.map((s) => (
                      <div key={s} className="flex items-center gap-1 text-destructive">
                        <Minus className="h-3 w-3" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        confirmLabel="Apply Permission Changes"
        variant="primary"
        isLoading={assignMutation.isPending}
        onConfirm={handleSaveConfirm}
      />
    </div>
  );
}
