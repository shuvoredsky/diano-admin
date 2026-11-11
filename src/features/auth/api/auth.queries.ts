import { queryOptions } from '@tanstack/react-query';

import { AUTH_QUERY_KEYS } from '../constants/auth.constants';
import { getCurrentAdminProfile } from './auth.api';

export const currentAdminQueryOptions = () =>
  queryOptions({
    queryKey: AUTH_QUERY_KEYS.currentUser(),
    queryFn: ({ signal }) => getCurrentAdminProfile(signal),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

