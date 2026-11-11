'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface UseTableQueryParamsOptions {
  defaultPage?: number;
  defaultLimit?: number;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export function useTableQueryParams(options: UseTableQueryParamsOptions = {}) {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    defaultSortBy,
    defaultSortOrder = 'asc',
  } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = useMemo(() => {
    const p = parseInt(searchParams.get('page') || '', 10);
    return isNaN(p) || p < 1 ? defaultPage : p;
  }, [searchParams, defaultPage]);

  const limit = useMemo(() => {
    const l = parseInt(searchParams.get('limit') || '', 10);
    return isNaN(l) || l < 1 ? defaultLimit : l;
  }, [searchParams, defaultLimit]);

  const sortBy = searchParams.get('sortBy') || defaultSortBy;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultSortOrder;
  const search = searchParams.get('q') || '';

  const updateParams = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      const qs = next.toString();
      const nextUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const setPage = useCallback(
    (newPage: number) => {
      updateParams({ page: newPage > 1 ? newPage : null });
    },
    [updateParams]
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      updateParams({ limit: newLimit !== defaultLimit ? newLimit : null, page: null });
    },
    [updateParams, defaultLimit]
  );

  const setSorting = useCallback(
    (column: string, order: 'asc' | 'desc') => {
      updateParams({
        sortBy: column,
        sortOrder: order,
        page: null,
      });
    },
    [updateParams]
  );

  const setSearch = useCallback(
    (query: string) => {
      updateParams({
        q: query.trim() || null,
        page: null,
      });
    },
    [updateParams]
  );

  const setFilter = useCallback(
    (key: string, value: string | null | undefined) => {
      updateParams({
        [key]: value,
        page: null,
      });
    },
    [updateParams]
  );

  const resetFilters = useCallback(
    (keysToPreserve: string[] = ['limit']) => {
      const next = new URLSearchParams();
      for (const key of keysToPreserve) {
        const val = searchParams.get(key);
        if (val) next.set(key, val);
      }
      const qs = next.toString();
      const nextUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    setPage,
    setLimit,
    setSorting,
    setSearch,
    setFilter,
    resetFilters,
    searchParams,
  };
}

