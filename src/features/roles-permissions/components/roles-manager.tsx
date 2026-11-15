'use client';

import { useState, useEffect } from 'react';
import { ShieldPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/shared/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { useRolesListQuery } from '../hooks/use-roles-queries';
import { RolesList } from './roles-list';
import { PermissionsMatrix } from './permissions-matrix';
import { RoleFormModal } from './role-form-modal';
import type { RoleSummaryItem } from '../types/roles.types';

export function RolesManager() {
  const { data: roles = [], isLoading } = useRolesListQuery();
  const [selectedRole, setSelectedRole] = useState<RoleSummaryItem | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<RoleSummaryItem | null>(null);

  // Auto-select first role when loaded if none selected
  useEffect(() => {
    if (!selectedRole && roles.length > 0) {
      setSelectedRole(roles[0] ?? null);
    }
  }, [roles, selectedRole]);

  const handleCreateOpen = () => {
    setRoleToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditOpen = (role: RoleSummaryItem) => {
    setRoleToEdit(role);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Roles & Permissions"
          description="Configure role hierarchy tiers and assign granular system permissions."
        />

        <PermissionGate permission={PERMISSIONS.ROLE_CREATE}>
          <Button onClick={handleCreateOpen} size="sm" className="h-8 gap-1.5 text-xs">
            <ShieldPlus className="h-4 w-4" />
            <span>Create Role</span>
          </Button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Roles list */}
        <div className="lg:col-span-5">
          <RolesList
            roles={roles}
            selectedRoleId={selectedRole?.id ?? null}
            onSelectRole={(r) => setSelectedRole(r)}
            onEditRole={handleEditOpen}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Dynamic permissions matrix */}
        <div className="lg:col-span-7">
          <PermissionsMatrix role={selectedRole} />
        </div>
      </div>

      {/* Role Create / Edit Modal */}
      <RoleFormModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setRoleToEdit(null);
        }}
        roleToEdit={roleToEdit}
      />
    </div>
  );
}
