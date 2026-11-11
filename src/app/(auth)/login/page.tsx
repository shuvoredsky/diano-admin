import { RoutePlaceholder } from '@/components/shared/route-placeholder';
import { AUTH_ROUTES } from '@/constants/routes';

export default function LoginPage() {
  return (
    <RoutePlaceholder
      title="Administrator Sign In"
      routePath={AUTH_ROUTES.LOGIN}
      moduleName="features/auth"
    />
  );
}

