import { RoutePlaceholder } from '@/components/shared/route-placeholder';
import { AUTH_ROUTES } from '@/constants/routes';

export default function ForgotPasswordPage() {
  return (
    <RoutePlaceholder
      title="Forgot Password"
      routePath={AUTH_ROUTES.FORGOT_PASSWORD}
      moduleName="features/auth"
    />
  );
}

