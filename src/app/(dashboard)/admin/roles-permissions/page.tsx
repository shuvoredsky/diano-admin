import type { Metadata } from 'next';

import { RoutePlaceholder } from '@/components/shared/route-placeholder';

export const metadata: Metadata = {
  title: 'Roles & Permissions',
};

export default function AdminRoutePage() {
  return (
    <RoutePlaceholder
      title="Roles & Permissions"
      route="/admin/roles-permissions"
      description="Role hierarchy and granular RBAC permission assignment foundation."
    />
  );
}
