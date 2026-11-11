'use client';

import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/store/hooks';
import { setAuthLoading, setSession, clearSession } from '@/store/slices/auth.slice';
import { clearAccessToken, setAccessToken } from '@/lib/auth/token-store';
import { onSessionExpired } from '@/lib/auth/auth-events';
import { refreshAdminSession, getCurrentAdminProfile } from '../api/auth.api';

export interface SessionBootstrapProviderProps {
  children: ReactNode;
}

export function SessionBootstrapProvider({ children }: SessionBootstrapProviderProps) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;

    // Listen to session expired events emitted by browserApiClient interceptor
    const unsubscribeSessionExpired = onSessionExpired(() => {
      dispatch(clearSession());
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    });

    async function bootstrap() {
      dispatch(setAuthLoading());

      try {
        // 1. Attempt silent token refresh via BFF
        const session = await refreshAdminSession();
        if (!isMounted) return;

        if (!session?.accessToken) {
          throw new Error('No access token received');
        }

        setAccessToken(session.accessToken);

        // 2. Fetch authenticated user profile & permissions from /auth/me
        const profile = await getCurrentAdminProfile();
        if (!isMounted) return;

        // 3. Populate Redux & React Query caches
        dispatch(
          setSession({
            user: profile,
            permissions: profile.permissions || [],
            isSuperAdmin: profile.isSuperAdmin,
          })
        );
        queryClient.setQueryData(['auth', 'me'], profile);
      } catch {
        if (!isMounted) return;
        clearAccessToken();
        dispatch(clearSession());
        queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
      unsubscribeSessionExpired();
    };
  }, [dispatch, queryClient]);

  return <>{children}</>;
}
