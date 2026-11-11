import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mapBackendValidationErrors } from '@/lib/crud/error-mapper';
import { useTableQueryParams } from '@/lib/crud/use-table-query-params';
import { useDirtyFormGuard } from '@/lib/crud/use-dirty-form-guard';
import { ApiClientError } from '@/lib/api/api-error';

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/admin/products',
}));

describe('Shared CRUD Infrastructure', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockReplace.mockReset();
    mockSearchParams = new URLSearchParams();
  });

  describe('mapBackendValidationErrors', () => {
    it('maps structured backend validation errors to React Hook Form setError', () => {
      const mockSetError = vi.fn();
      const apiError = new ApiClientError({
        message: 'Validation failed',
        statusCode: 400,
        errors: [
          { field: 'name', message: 'Name must be at least 2 characters' },
          { field: 'variants.0.price', message: 'Price must be positive' },
        ],
      });

      const primaryMessage = mapBackendValidationErrors(apiError, mockSetError);

      expect(primaryMessage).toBe('Validation failed');
      expect(mockSetError).toHaveBeenCalledWith('name', {
        type: 'server',
        message: 'Name must be at least 2 characters',
      });
      expect(mockSetError).toHaveBeenCalledWith('variants.0.price', {
        type: 'server',
        message: 'Price must be positive',
      });
    });

    it('falls back to generic error message for standard Error instance', () => {
      const mockSetError = vi.fn();
      const standardError = new Error('Network timeout');

      const primaryMessage = mapBackendValidationErrors(standardError, mockSetError);

      expect(primaryMessage).toBe('Network timeout');
      expect(mockSetError).not.toHaveBeenCalled();
    });
  });

  describe('useTableQueryParams', () => {
    it('parses default pagination and sorting values when params are absent', () => {
      const { result } = renderHook(() =>
        useTableQueryParams({ defaultPage: 1, defaultLimit: 20, defaultSortBy: 'name' })
      );

      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(20);
      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortOrder).toBe('asc');
      expect(result.current.search).toBe('');
    });

    it('updates URL search parameters when setting page, sorting, and search query', () => {
      const { result } = renderHook(() => useTableQueryParams());

      act(() => {
        result.current.setPage(3);
      });
      expect(mockReplace).toHaveBeenCalledWith('/admin/products?page=3', { scroll: false });

      act(() => {
        result.current.setSorting('price', 'desc');
      });
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=price&sortOrder=desc'),
        { scroll: false }
      );

      act(() => {
        result.current.setSearch('panjabi');
      });
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('q=panjabi'),
        { scroll: false }
      );
    });
  });

  describe('useDirtyFormGuard', () => {
    it('attaches beforeunload listener when form is dirty and prompts on confirmNavigation', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      const { result, unmount } = renderHook(() => useDirtyFormGuard(true));

      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

      const canNavigate = result.current.confirmNavigation();
      expect(canNavigate).toBe(false);
      expect(confirmSpy).toHaveBeenCalled();

      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });
});

