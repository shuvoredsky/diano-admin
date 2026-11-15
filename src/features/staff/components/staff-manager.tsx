'use client';

import { useState, useMemo } from 'react';
import { UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/shared/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { useStaffListQuery } from '../hooks/use-staff-queries';
import { useRolesListQuery } from '@/features/roles-permissions/hooks/use-roles-queries';
import { StaffFilterBar } from './staff-filter-bar';
import { StaffTable } from './staff-table';
import { StaffFormModal } from './staff-form-modal';
import type { StaffUser } from '../types/staff.types';

export function StaffManager() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffUser | null>(null);

  const { data: staffData, isLoading: staffLoading, refetch } = useStaffListQuery({
    page,
    limit,
    role: role || undefined,
    status: status || undefined,
    search: search.trim() || undefined,
  });

  const { data: rolesData } = useRolesListQuery();
  const rolesList = useMemo(() => rolesData?.map((r) => ({ slug: r.slug, name: r.name })) ?? [], [rolesData]);

  const handleCreateOpen = () => {
    setStaffToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditOpen = (user: StaffUser) => {
    setStaffToEdit(user);
    setIsModalOpen(true);
  };

  const total = staffData?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Staff Management"
          description="Manage administrative users, role assignments, and account operational statuses."
        />

        <PermissionGate permission={PERMISSIONS.USER_CREATE}>
          <Button onClick={handleCreateOpen} size="sm" className="h-8 gap-1.5 text-xs">
            <UserPlus className="h-4 w-4" />
            <span>Invite / Create Staff</span>
          </Button>
        </PermissionGate>
      </div>

      <StaffFilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        role={role}
        onRoleChange={(val) => {
          setRole(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        rolesList={rolesList}
        onRefresh={() => refetch()}
        isLoading={staffLoading}
      />

      <StaffTable
        data={staffData?.users ?? []}
        isLoading={staffLoading}
        onEdit={handleEditOpen}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <span>
            Showing page {page} of {totalPages} ({total} staff members)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || staffLoading}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || staffLoading}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Staff Create / Edit Modal */}
      <StaffFormModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setStaffToEdit(null);
        }}
        staffToEdit={staffToEdit}
        rolesList={rolesList}
      />
    </div>
  );
}
