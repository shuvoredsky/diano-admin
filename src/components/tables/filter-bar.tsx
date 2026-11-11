'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Search, X, RotateCcw } from 'lucide-react';

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchParamKey?: string;
  children?: ReactNode;
  actions?: ReactNode;
  showClear?: boolean;
  onClearFilters?: () => void;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = 'Search...',
  searchParamKey = 'search',
  children,
  actions,
  showClear = true,
  onClearFilters,
  className,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearchVal = searchParams?.get(searchParamKey) || '';
  const [searchValue, setSearchValue] = useState(urlSearchVal);
  const debouncedSearch = useDebounce(searchValue, 350);

  useEffect(() => {
    setSearchValue(urlSearchVal);
  }, [urlSearchVal]);

  useEffect(() => {
    if (debouncedSearch === urlSearchVal) return;

    const params = new URLSearchParams(searchParams?.toString() || '');
    if (debouncedSearch.trim()) {
      params.set(searchParamKey, debouncedSearch.trim());
      params.set('page', '1');
    } else {
      params.delete(searchParamKey);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, searchParamKey, pathname, router, searchParams, urlSearchVal]);

  const handleClearAll = () => {
    setSearchValue('');
    if (onClearFilters) {
      onClearFilters();
    } else {
      router.push(pathname);
    }
  };

  const hasActiveFilters = Boolean(
    searchValue || (searchParams && Array.from(searchParams.keys()).some(k => k !== 'page' && k !== 'limit'))
  );

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between ${className || ''}`}>
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter slots */}
        {children}

        {/* Reset button */}
        {showClear && hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-9 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
