export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  currentUser: () => [...AUTH_QUERY_KEYS.all, 'me'] as const,
} as const;

