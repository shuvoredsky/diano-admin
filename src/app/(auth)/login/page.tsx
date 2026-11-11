'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '@/store/hooks';
import { setSession } from '@/store/slices/auth.slice';
import { usePermissions } from '@/hooks/use-permissions';
import { adminLoginSchema, type AdminLoginFormValues } from '@/features/auth/schemas/auth.schema';
import { loginAdmin, getCurrentAdminProfile } from '@/features/auth/api/auth.api';
import { sanitizeReturnUrl } from '@/lib/auth/proxy-guard';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: isAuthLoading } = usePermissions();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const rawReturnTo = searchParams?.get('returnTo') || searchParams?.get('returnUrl');
  const safeReturnTo = sanitizeReturnUrl(rawReturnTo);

  // If already authenticated, redirect to safe return destination
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(safeReturnTo);
    }
  }, [isAuthenticated, isAuthLoading, router, safeReturnTo]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AdminLoginFormValues) => {
    setServerError(null);

    try {
      // 1. Authenticate with backend
      await loginAdmin(values);

      // 2. Fetch authenticated profile & effective permissions
      const profile = await getCurrentAdminProfile();

      // 3. Populate Redux session state
      dispatch(
        setSession({
          user: profile,
          permissions: profile.permissions || [],
          isSuperAdmin: profile.isSuperAdmin,
        })
      );

      // 4. Navigate to sanitized return destination
      router.push(safeReturnTo);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please verify your credentials or network connection.';
      setServerError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint border border-primary/20 text-primary-deep shadow-2xs">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            DIANO Admin Portal
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Authorized administrative access for e-commerce operations, catalog management, and order fulfillment.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          {/* Server Error Alert */}
          {serverError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive font-medium"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1">{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email Field */}
            <FormField
              label="Staff Email Address"
              htmlFor="email"
              required
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="staff@diano.com.bd"
                disabled={isSubmitting}
                className="h-10 text-sm"
                {...register('email')}
              />
            </FormField>

            {/* Password Field */}
            <FormField
              label="Password"
              htmlFor="password"
              required
              error={errors.password?.message}
            >
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                  className="h-10 pr-10 text-sm"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-hidden"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </FormField>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 font-semibold text-sm shadow-xs mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                'Sign In to Portal'
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-border/60 text-center">
            <span className="text-[11px] text-muted-foreground">
              Security notice: All administrative access attempts are recorded in the Dhaka audit trail with IP & device signature.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
