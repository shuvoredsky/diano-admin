import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  ReviewsTable,
  ReviewsFilterBar,
  ReviewDetailModal,
  ReviewsManager,
  type ReviewEntity,
} from '@/features/reviews';
import * as usePermissionsHook from '@/hooks/use-permissions';
import * as ReviewsQueriesModule from '@/features/reviews/hooks/use-reviews-queries';

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
  usePathname: () => '/admin/reviews',
  useSearchParams: () => mockSearchParams,
}));

const mockUpdateStatusMutateAsync = vi.fn();
const mockDeleteReviewMutateAsync = vi.fn();

const mockReviewPending: ReviewEntity = {
  id: 'rev-201',
  userId: 'usr-901',
  productId: 'prod-401',
  orderItemId: 'item-801',
  rating: 5,
  title: 'Outstanding Panjabi Quality',
  comment: 'Fabric feels luxurious and fits perfectly in Dhaka humid weather.',
  isVerifiedPurchase: true,
  status: 'PENDING',
  moderationReason: null,
  moderatedById: null,
  moderatedAt: null,
  createdAt: '2026-11-14T10:00:00.000Z',
  updatedAt: '2026-11-14T10:00:00.000Z',
  user: {
    id: 'usr-901',
    name: 'Tamim Rahman',
    avatarUrl: null,
  },
  product: {
    id: 'prod-401',
    name: 'Signature Royal Silk Panjabi',
    slug: 'signature-royal-silk-panjabi',
  },
  images: [
    {
      id: 'img-1',
      url: 'https://res.cloudinary.com/diano/image/upload/rev1.jpg',
    },
  ],
};

const mockReviewXSS: ReviewEntity = {
  id: 'rev-202',
  userId: 'usr-902',
  productId: 'prod-402',
  orderItemId: null,
  rating: 1,
  title: '<script>alert("xss-title")</script>',
  comment: '<img src="x" onerror="window.__xss=true" /> Malicious payload test.',
  isVerifiedPurchase: false,
  status: 'REJECTED',
  moderationReason: 'Spam attempt',
  moderatedById: 'usr-admin',
  moderatedAt: '2026-11-14T12:00:00.000Z',
  createdAt: '2026-11-14T11:00:00.000Z',
  updatedAt: '2026-11-14T12:00:00.000Z',
  user: {
    id: 'usr-902',
    name: '<b onmouseover="alert(1)">Hacker</b>',
    avatarUrl: null,
  },
  product: {
    id: 'prod-402',
    name: 'Casual Polo',
    slug: 'casual-polo',
  },
  images: [],
};

vi.mock('@/features/reviews/hooks/use-reviews-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof ReviewsQueriesModule>();
  return {
    ...actual,
    useAdminReviewsQuery: vi.fn(() => ({
      data: {
        data: [mockReviewPending, mockReviewXSS],
        meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
      },
      isLoading: false,
    })),
    useAdminReviewDetailQuery: vi.fn((id?: string) => ({
      data: id === 'rev-202' ? mockReviewXSS : mockReviewPending,
      isLoading: false,
    })),
    useUpdateReviewStatusMutation: vi.fn(() => ({
      mutateAsync: mockUpdateStatusMutateAsync,
      isPending: false,
    })),
    useDeleteReviewMutation: vi.fn(() => ({
      mutateAsync: mockDeleteReviewMutateAsync,
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

describe('Phase 8B: Reviews Moderation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    setupPermissions(['review:read', 'review:moderate'], true);
  });

  describe('1. Reviews Table & Rendering', () => {
    it('renders customer name, product, rating, and review text', () => {
      render(
        <AppProviders>
          <ReviewsTable
            reviews={[mockReviewPending]}
            isLoading={false}
            onSelectReview={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Tamim Rahman')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('Signature Royal Silk Panjabi')).toBeInTheDocument();
      expect(screen.getByText('Outstanding Panjabi Quality')).toBeInTheDocument();
      expect(screen.getByText(/Fabric feels luxurious/)).toBeInTheDocument();
    });

    it('triggers delete confirmation dialog and calls delete mutation', async () => {
      render(
        <AppProviders>
          <ReviewsTable
            reviews={[mockReviewPending]}
            isLoading={false}
            onSelectReview={vi.fn()}
          />
        </AppProviders>
      );

      const deleteBtn = screen.getByTitle('Delete review');
      fireEvent.click(deleteBtn);

      expect(screen.getByText(/Are you sure you want to permanently delete this customer review\?/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: 'Delete Review' });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockDeleteReviewMutateAsync).toHaveBeenCalledWith('rev-201');
      });
    });
  });

  describe('2. Reviews Filter Bar', () => {
    it('synchronizes search, status, and rating with URL parameters', () => {
      mockSearchParams = new URLSearchParams('search=silk&status=PENDING&rating=5');

      render(
        <AppProviders>
          <ReviewsFilterBar />
        </AppProviders>
      );

      const searchInput = screen.getByPlaceholderText(/search reviews/i);
      expect(searchInput).toHaveValue('silk');

      const statusSelect = screen.getByLabelText(/filter by review status/i);
      expect(statusSelect).toHaveValue('PENDING');

      const ratingSelect = screen.getByLabelText(/filter by rating/i);
      expect(ratingSelect).toHaveValue('5');

      fireEvent.change(searchInput, { target: { value: 'cotton' } });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('search=cotton'), { scroll: false });

      fireEvent.change(statusSelect, { target: { value: 'APPROVED' } });
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('status=APPROVED'), { scroll: false });
    });
  });

  describe('3. Review Detail Modal & Moderation Actions', () => {
    it('approves a pending review via status mutation', async () => {
      render(
        <AppProviders>
          <ReviewDetailModal
            reviewId="rev-201"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Signature Royal Silk Panjabi')).toBeInTheDocument();

      const approveBtn = screen.getByRole('button', { name: /approve review/i });
      fireEvent.click(approveBtn);

      // Confirm dialog opens
      const confirmApproveBtn = screen.getByRole('button', { name: 'Approve Review' });
      fireEvent.click(confirmApproveBtn);

      await waitFor(() => {
        expect(mockUpdateStatusMutateAsync).toHaveBeenCalledWith({
          id: 'rev-201',
          input: { status: 'APPROVED' },
        });
      });
    });

    it('rejects a review with a moderation explanation', async () => {
      render(
        <AppProviders>
          <ReviewDetailModal
            reviewId="rev-201"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      const rejectBtn = screen.getByRole('button', { name: /reject/i });
      fireEvent.click(rejectBtn);

      const reasonInput = screen.getByPlaceholderText(/inappropriate language/i);
      fireEvent.change(reasonInput, { target: { value: 'Review contains external advertising link.' } });

      const confirmRejectBtn = screen.getByRole('button', { name: 'Reject Review' });
      fireEvent.click(confirmRejectBtn);

      await waitFor(() => {
        expect(mockUpdateStatusMutateAsync).toHaveBeenCalledWith({
          id: 'rev-201',
          input: {
            status: 'REJECTED',
            reason: 'Review contains external advertising link.',
          },
        });
      });
    });
  });

  describe('4. XSS & HTML Escaping Safety', () => {
    it('escapes raw HTML tags in review title, comment, and reviewer name safely as text', () => {
      render(
        <AppProviders>
          <ReviewDetailModal
            reviewId="rev-202"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      // Verify that malicious script/image tags are rendered as plain text, NOT executed in DOM
      expect(screen.getByText('<script>alert("xss-title")</script>')).toBeInTheDocument();
      expect(screen.getByText(/<img src="x" onerror="window.__xss=true" \/>/)).toBeInTheDocument();
      expect(screen.getByText('<b onmouseover="alert(1)">Hacker</b>')).toBeInTheDocument();

      // Ensure window.__xss was NOT triggered
      expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined();
    });
  });

  describe('5. Permission Gates', () => {
    it('hides all moderation mutating buttons for users with read-only access', () => {
      setupPermissions(['review:read'], false);

      render(
        <AppProviders>
          <ReviewsManager />
        </AppProviders>
      );

      expect(screen.queryByTitle('Delete review')).not.toBeInTheDocument();

      render(
        <AppProviders>
          <ReviewDetailModal
            reviewId="rev-201"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /approve review/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('renders only whitelisted Cloudinary images and discards unverified external image hosts', () => {
      setupPermissions(['review:read', 'review:moderate'], true);

      const untrustedReview: ReviewEntity = {
        ...mockReviewPending,
        id: 'rev-untrusted-img',
        images: [
          { id: 'img-safe', url: 'https://res.cloudinary.com/diano/image/upload/safe.jpg' },
          { id: 'img-malicious', url: 'https://evil-untrusted-site.com/exploit.png' },
        ],
      };

      vi.mocked(ReviewsQueriesModule.useAdminReviewDetailQuery).mockReturnValue({
        data: untrustedReview,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        status: 'success',
      } as unknown as ReturnType<typeof ReviewsQueriesModule.useAdminReviewDetailQuery>);

      render(
        <AppProviders>
          <ReviewDetailModal
            reviewId="rev-untrusted-img"
            isOpen={true}
            onClose={vi.fn()}
          />
        </AppProviders>
      );

      // Verifies safe Cloudinary image is rendered
      expect(screen.getByText('Attached Photos (1)')).toBeInTheDocument();
      const images = screen.getAllByRole('img');
      const reviewAttachments = images.filter((img) => img.getAttribute('alt') === 'Review attachment');
      expect(reviewAttachments).toHaveLength(1);
      expect(reviewAttachments[0]).toHaveAttribute('src', expect.stringContaining('res.cloudinary.com'));

      // Verifies malicious non-Cloudinary image was excluded
      expect(screen.queryByRole('link', { name: /exploit\.png/i })).not.toBeInTheDocument();
    });
  });
});

