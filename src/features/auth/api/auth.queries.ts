import { queryOptions } from '@tanstack/react-query';

import { AUTH_QUERY_KEYS } from '../constants/auth.constants';
import { getCurrentAdminProfile } from './auth.api';
import type { AuthUserSummary } from '@/types/auth.types';

export const currentAdminQueryOptions = () =>
  queryOptions<AuthUserSummary>({
    queryKey: AUTH_QUERY_KEYS.currentUser(),
    queryFn: ({ signal }): Promise<AuthUserSummary> => getCurrentAdminProfile(signal),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
