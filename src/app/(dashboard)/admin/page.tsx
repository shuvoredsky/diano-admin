import { RoutePlaceholder } from '@/components/shared/route-placeholder';
import { ADMIN_ROUTES } from '@/constants/routes';
import { PERMISSIONS } from '@/constants/permissions';

export default function AdminRootPage() {
  return (
    <RoutePlaceholder
      title="Admin Dashboard Overview"
      routePath={ADMIN_ROUTES.ROOT}
      moduleName="features/analytics"
      requiredPermission={PERMISSIONS.ORDER_READ}
    />
  );
}

