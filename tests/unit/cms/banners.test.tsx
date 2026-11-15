import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  BannersTable,
  BannersFilterBar,
  BannerFormModal,
  BannersManager,
  type BannerEntity,
} from '@/features/cms';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as BannersQueriesModule from '@/features/cms/hooks/use-banners-queries';

let mockSearchParams = new URLSearchParams();
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/cms',
  useSearchParams: () => mockSearchParams,
}));

const mockCreateBannerMutateAsync = vi.fn();
const mockUpdateBannerMutateAsync = vi.fn();
const mockToggleBannerMutate = vi.fn();
const mockDeleteBannerMutateAsync = vi.fn();

const mockBannerHero: BannerEntity = {
  id: 'banner-01',
  placement: 'HOME_HERO',
  title: 'Eid Silk Panjabi Collection 2026',
  subtitle: 'Handcrafted Heritage Royal Panjabis in Dhaka',
  desktopImage: 'https://res.cloudinary.com/diano/image/upload/hero1.jpg',
  mobileImage: 'https://res.cloudinary.com/diano/image/upload/hero1-mobile.jpg',
  altText: 'Eid royal panjabi hero banner',
  linkUrl: '/products?category=panjabi',
  ctaText: 'Explore Collection',
  startsAt: '2026-03-01T00:00:00.000Z',
  endsAt: '2026-04-15T23:59:59.000Z',
  isActive: true,
  sortOrder: 1,
  clickCount: 1420,
  createdAt: '2026-02-15T10:00:00.000Z',
  updatedAt: '2026-02-15T10:00:00.000Z',
};

const mockBannerPopup: BannerEntity = {
  id: 'banner-02',
  placement: 'POPUP',
  title: 'Flash 10% First Order Coupon',
  subtitle: 'Use code WELCOME10 at checkout',
  desktopImage: 'https://res.cloudinary.com/diano/image/upload/popup.jpg',
  mobileImage: null,
  altText: 'First order popup',
  linkUrl: '/register',
  ctaText: 'Claim 10% Off',
  startsAt: null,
  endsAt: null,
  isActive: false,
  sortOrder: 2,
  clickCount: 310,
  createdAt: '2026-02-16T12:00:00.000Z',
  updatedAt: '2026-02-16T12:00:00.000Z',
};

vi.mock('@/features/cms/hooks/use-banners-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof BannersQueriesModule>();
  return {
    ...actual,
    useBannersQuery: vi.fn(() => ({
      data: {
        data: [mockBannerHero, mockBannerPopup],
        meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
      },
      isLoading: false,
    })),
    useBannerDetailQuery: vi.fn((id?: string) => ({
      data: id === 'banner-01' ? mockBannerHero : mockBannerPopup,
      isLoading: false,
    })),
    useCreateBannerMutation: vi.fn(() => ({
      mutateAsync: mockCreateBannerMutateAsync,
      isPending: false,
    })),
    useUpdateBannerMutation: vi.fn(() => ({
      mutateAsync: mockUpdateBannerMutateAsync,
      isPending: false,
    })),
    useToggleBannerMutation: vi.fn(() => ({
      mutate: mockToggleBannerMutate,
      isPending: false,
    })),
    useDeleteBannerMutation: vi.fn(() => ({
      mutateAsync: mockDeleteBannerMutateAsync,
      isPending: false,
    })),
  };
});

function setupPermissions(permissions: string[], isSuperAdmin = false) {
  vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
    permissions,
    isSuperAdmin,
    roles: isSuperAdmin ? ['ADMIN'] : ['STAFF'],
    user: { id: 'usr-admin', email: 'admin@diano.com', name: 'Admin', roles: ['ADMIN'] },
    hasPermission: (perm: string) => isSuperAdmin || permissions.includes(perm),
    hasAnyPermission: (perms: string[]) => isSuperAdmin || perms.some((p) => permissions.includes(p)),
    hasAllPermissions: (perms: string[]) => isSuperAdmin || perms.every((p) => permissions.includes(p)),
    isLoading: false,
    isAuthenticated: true,
  });
}

describe('Phase 9A: Banners Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    setupPermissions(['banner:manage'], true);
  });

  describe('1. Banners Table & Rendering', () => {
    it('renders banner rows with title, placement badge, active switch, and schedule', () => {
      render(
        <AppProviders>
          <BannersTable
            data={[mockBannerHero, mockBannerPopup]}
            isLoading={false}
            total={2}
            page={1}
            limit={20}
            onPageChange={vi.fn()}
            onPageSizeChange={vi.fn()}
            onEdit={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Eid Silk Panjabi Collection 2026')).toBeInTheDocument();
      expect(screen.getByText('Handcrafted Heritage Royal Panjabis in Dhaka')).toBeInTheDocument();
      expect(screen.getByText('HOME HERO')).toBeInTheDocument();
      expect(screen.getByText('Flash 10% First Order Coupon')).toBeInTheDocument();
      expect(screen.getByText('POPUP')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });

    it('renders filter bar and updates placement filter parameter', () => {
      render(
        <AppProviders>
          <BannersFilterBar />
        </AppProviders>
      );

      const select = screen.getByLabelText(/filter by placement/i);
      expect(select).toBeInTheDocument();
      fireEvent.change(select, { target: { value: 'HOME_HERO' } });
      expect(mockReplace).toHaveBeenCalled();
    });

    it('triggers delete confirmation dialog and calls delete mutation', async () => {
      render(
        <AppProviders>
          <BannersTable
            data={[mockBannerHero]}
            isLoading={false}
            total={1}
            page={1}
            limit={20}
            onPageChange={vi.fn()}
            onPageSizeChange={vi.fn()}
            onEdit={vi.fn()}
          />
        </AppProviders>
      );

      const deleteBtn = screen.getByTitle('Delete banner');
      fireEvent.click(deleteBtn);

      expect(screen.getByText(/Delete Promotional Banner/i)).toBeInTheDocument();
      const confirmBtn = screen.getByRole('button', { name: 'Delete Banner' });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockDeleteBannerMutateAsync).toHaveBeenCalledWith('banner-01');
      });
    });
  });

  describe('2. Banner Form Modal & Validation', () => {
    it('validates required fields: title min 2 chars and desktop image', async () => {
      render(
        <AppProviders>
          <BannerFormModal open={true} onOpenChange={vi.fn()} />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /create banner/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Title must be at least 2 characters/i)).toBeInTheDocument();

      const titleInput = screen.getByLabelText(/Banner Title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Winter Hoodie Sale' } });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Desktop image URL is required/i)).toBeInTheDocument();
    });

    it('submits valid banner with Dhaka local schedule dates converted to ISO strings', async () => {
      render(
        <AppProviders>
          <BannerFormModal open={true} onOpenChange={vi.fn()} />
        </AppProviders>
      );

      fireEvent.change(screen.getByLabelText(/Banner Title \*/i), {
        target: { value: 'Summer Lawn Collection 2026' },
      });
      fireEvent.change(screen.getByLabelText(/Desktop Image URL \*/i), {
        target: { value: 'https://res.cloudinary.com/diano/image/upload/summer.jpg' },
      });
      fireEvent.change(screen.getByLabelText(/Destination Link/i), {
        target: { value: '/products?category=women-lawn' },
      });
      fireEvent.change(screen.getByLabelText(/Start Schedule/i), {
        target: { value: '2026-05-01T10:00' },
      });
      fireEvent.change(screen.getByLabelText(/End Schedule/i), {
        target: { value: '2026-05-31T22:00' },
      });

      const submitBtn = screen.getByRole('button', { name: /create banner/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateBannerMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Summer Lawn Collection 2026',
            desktopImage: 'https://res.cloudinary.com/diano/image/upload/summer.jpg',
            linkUrl: '/products?category=women-lawn',
            startsAt: expect.stringContaining('2026-05-01'),
            endsAt: expect.stringContaining('2026-05-31'),
          })
        );
      });
    });

    it('displays backend error message as-is when banner creation fails', async () => {
      mockCreateBannerMutateAsync.mockRejectedValueOnce({
        response: {
          data: {
            message: 'A banner with this title already exists in the selected placement slot',
          },
        },
      });

      render(
        <AppProviders>
          <BannerFormModal open={true} onOpenChange={vi.fn()} />
        </AppProviders>
      );

      fireEvent.change(screen.getByLabelText(/Banner Title \*/i), {
        target: { value: 'Duplicate Banner' },
      });
      fireEvent.change(screen.getByLabelText(/Desktop Image URL \*/i), {
        target: { value: 'https://res.cloudinary.com/diano/image/upload/dup.jpg' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create banner/i }));

      expect(
        await screen.findByText(/A banner with this title already exists in the selected placement slot/i)
      ).toBeInTheDocument();
    });

    it('rejects unsafe destination link schemes (javascript:, data:, protocol-relative //)', async () => {
      render(
        <AppProviders>
          <BannerFormModal open={true} onOpenChange={vi.fn()} />
        </AppProviders>
      );

      fireEvent.change(screen.getByLabelText(/Banner Title \*/i), {
        target: { value: 'Test Link Safety' },
      });
      fireEvent.change(screen.getByLabelText(/Desktop Image URL \*/i), {
        target: { value: 'https://res.cloudinary.com/diano/image/upload/safe.jpg' },
      });
      fireEvent.change(screen.getByLabelText(/Destination Link/i), {
        target: { value: 'javascript:alert("pwned")' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create banner/i }));

      expect(
        await screen.findByText(/Destination link must be an http\/https URL or internal relative path/i)
      ).toBeInTheDocument();
      expect(mockCreateBannerMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('3. Permission Gates', () => {
    it('hides all create and action mutating buttons when user lacks banner:manage', () => {
      setupPermissions(['banner:read'], false);

      render(
        <AppProviders>
          <BannersManager />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /create banner/i })).not.toBeInTheDocument();
      expect(screen.queryByTitle('Edit banner')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Delete banner')).not.toBeInTheDocument();
    });
  });
});
