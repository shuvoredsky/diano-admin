import { RoutePlaceholder } from '@/components/shared/route-placeholder';
import { AUTH_ROUTES } from '@/constants/routes';

export default function ResetPasswordPage() {
  return (
    <RoutePlaceholder
      title="Reset Password"
      routePath={AUTH_ROUTES.RESET_PASSWORD}
      moduleName="features/auth"
    />
  );
}

