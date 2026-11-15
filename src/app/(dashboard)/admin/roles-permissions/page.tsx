import type { Metadata } from 'next';
import { RolesManager } from '@/features/roles-permissions/components/roles-manager';

export const metadata: Metadata = {
  title: 'Roles & Permissions | DIANO Admin',
  description: 'Role hierarchy and granular RBAC permission assignment.',
};

export default function AdminRolesPermissionsPage() {
  return <RolesManager />;
}
