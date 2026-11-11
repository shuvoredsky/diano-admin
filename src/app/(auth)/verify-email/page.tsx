import { RoutePlaceholder } from '@/components/shared/route-placeholder';
import { AUTH_ROUTES } from '@/constants/routes';

export default function VerifyEmailPage() {
  return (
    <RoutePlaceholder
      title="Verify Email Address"
      routePath={AUTH_ROUTES.VERIFY_EMAIL}
      moduleName="features/auth"
    />
  );
}

