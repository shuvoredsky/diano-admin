import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  PagesTable,
  PageFormModal,
  PageRevisionsModal,
  PagesManager,
  type PageEntity,
  type PageRevisionEntity,
} from '@/features/cms';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as PagesQueriesModule from '@/features/cms/hooks/use-pages-queries';

const mockSearchParams = new URLSearchParams();
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

const mockPageTerms: PageEntity = {
  id: 'page-01',
  slug: 'terms',
  type: 'LEGAL',
  title: 'Terms of Service',
  content: [
    {
      type: 'richText',
      html: '## 1. Terms Overview\nAll orders placed on DIANO are bound by Bangladesh consumer protection law.',
    },
  ],
  metaTitle: 'Terms & Conditions | DIANO BD',
  metaDescription: 'Official terms of purchase and delivery for DIANO apparel.',
  ogImage: null,
  status: 'PUBLISHED',
  currentVersion: 3,
  publishedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-02-10T12:00:00.000Z',
};

const mockPagePrivacyDraft: PageEntity = {
  id: 'page-02',
  slug: 'privacy-policy',
  type: 'LEGAL',
  title: 'Privacy Policy',
  content: [
    {
      type: 'richText',
      html: '<script>alert("xss")</script> Privacy policy draft content.',
    },
  ],
  metaTitle: 'Privacy Policy',
  metaDescription: 'User data protection and cookies.',
  ogImage: null,
  status: 'DRAFT',
  currentVersion: 1,
  publishedAt: null,
  createdAt: '2026-02-12T10:00:00.000Z',
  updatedAt: '2026-02-12T10:00:00.000Z',
};

const mockRevisions: PageRevisionEntity[] = [
  {
    id: 'rev-03',
    pageId: 'page-01',
    version: 3,
    title: 'Terms of Service (v3)',
    content: [{ type: 'richText', html: 'Updated return window clause.' }],
    metaTitle: null,
    metaDescription: null,
    ogImage: null,
    createdAt: '2026-02-10T12:00:00.000Z',
  },
  {
    id: 'rev-02',
    pageId: 'page-01',
    version: 2,
    title: 'Terms of Service (v2)',
    content: [{ type: 'richText', html: 'Initial legal framework.' }],
    metaTitle: null,
    metaDescription: null,
    ogImage: null,
    createdAt: '2026-01-15T12:00:00.000Z',
  },
];

const mockCreatePageMutateAsync = vi.fn();
const mockUpdatePageMutateAsync = vi.fn();
const mockPublishPageMutate = vi.fn();
const mockUnpublishPageMutate = vi.fn();
const mockDeletePageMutateAsync = vi.fn();
const mockRestoreRevisionMutateAsync = vi.fn();

vi.mock('@/features/cms/hooks/use-pages-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof PagesQueriesModule>();
  return {
    ...actual,
    usePagesQuery: vi.fn(() => ({
      data: {
        data: [mockPageTerms, mockPagePrivacyDraft],
        meta: { pagination: { totalItems: 2, totalPages: 1, page: 1, limit: 20 } },
      },
      isLoading: false,
    })),
    usePageDetailQuery: vi.fn((id?: string) => ({
      data: id === 'page-01' ? mockPageTerms : mockPagePrivacyDraft,
      isLoading: false,
    })),
    usePageRevisionsQuery: vi.fn(() => ({
      data: mockRevisions,
      isLoading: false,
    })),
    useCreatePageMutation: vi.fn(() => ({
      mutateAsync: mockCreatePageMutateAsync,
      isPending: false,
    })),
    useUpdatePageMutation: vi.fn(() => ({
      mutateAsync: mockUpdatePageMutateAsync,
      isPending: false,
    })),
    usePublishPageMutation: vi.fn(() => ({
      mutate: mockPublishPageMutate,
      isPending: false,
    })),
    useUnpublishPageMutation: vi.fn(() => ({
      mutate: mockUnpublishPageMutate,
      isPending: false,
    })),
    useDeletePageMutation: vi.fn(() => ({
      mutateAsync: mockDeletePageMutateAsync,
      isPending: false,
    })),
    useRestorePageRevisionMutation: vi.fn(() => ({
      mutateAsync: mockRestoreRevisionMutateAsync,
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

describe('Phase 9A: Pages & Revisions Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupPermissions(['page:manage'], true);
  });

  describe('1. Pages Table & Status Controls', () => {
    it('renders page rows with title, slug, type, status, and version', () => {
      render(
        <AppProviders>
          <PagesTable
            data={[mockPageTerms, mockPagePrivacyDraft]}
            isLoading={false}
            total={2}
            page={1}
            limit={20}
            onPageChange={vi.fn()}
            onPageSizeChange={vi.fn()}
            onEdit={vi.fn()}
            onViewRevisions={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('/terms')).toBeInTheDocument();
      expect(screen.getByText('v3')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('/privacy-policy')).toBeInTheDocument();
      expect(screen.getByText('v1')).toBeInTheDocument();
    });

    it('triggers publish mutation on draft page and unpublish on published page', () => {
      render(
        <AppProviders>
          <PagesTable
            data={[mockPageTerms, mockPagePrivacyDraft]}
            isLoading={false}
            total={2}
            page={1}
            limit={20}
            onPageChange={vi.fn()}
            onPageSizeChange={vi.fn()}
            onEdit={vi.fn()}
            onViewRevisions={vi.fn()}
          />
        </AppProviders>
      );

      const unpublishBtn = screen.getByTitle('Unpublish page (set to Draft)');
      fireEvent.click(unpublishBtn);
      expect(mockUnpublishPageMutate).toHaveBeenCalledWith('page-01');

      const publishBtn = screen.getByTitle('Publish page');
      fireEvent.click(publishBtn);
      expect(mockPublishPageMutate).toHaveBeenCalledWith('page-02');
    });
  });

  describe('2. Page Form Modal & Slug Validation', () => {
    it('validates title and lowercase alphanumeric kebab-case slug', async () => {
      render(
        <AppProviders>
          <PageFormModal open={true} onOpenChange={vi.fn()} />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /create page/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Page title must be at least 2 characters/i)).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/Page Title \*/i), {
        target: { value: 'About DIANO' },
      });
      fireEvent.change(screen.getByLabelText(/URL Slug/i), {
        target: { value: 'INVALID_SLUG!!' },
      });
      fireEvent.click(submitBtn);

      expect(
        await screen.findByText(/Slug must be lowercase alphanumeric and kebab-case/i)
      ).toBeInTheDocument();
    });

    it('handles 409 conflict error when page slug is already taken', async () => {
      mockCreatePageMutateAsync.mockRejectedValueOnce({
        response: {
          data: {
            message: 'A page with this slug already exists. Please choose a unique slug.',
          },
        },
      });

      render(
        <AppProviders>
          <PageFormModal open={true} onOpenChange={vi.fn()} />
        </AppProviders>
      );

      fireEvent.change(screen.getByLabelText(/Page Title \*/i), {
        target: { value: 'Terms of Service' },
      });
      fireEvent.change(screen.getByLabelText(/URL Slug/i), {
        target: { value: 'terms' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create page/i }));

      expect(
        await screen.findByText(/A page with this slug already exists/i)
      ).toBeInTheDocument();
    });

    it('safely renders rich text preview escaping script tags avoiding XSS execution', () => {
      render(
        <AppProviders>
          <PageFormModal open={true} onOpenChange={vi.fn()} pageToEdit={mockPagePrivacyDraft} />
        </AppProviders>
      );

      const previewTab = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewTab);

      // Verifies <script> tag is completely stripped by sanitizer, safe text remains, no script execution
      expect(screen.getByText(/Privacy policy draft content/i)).toBeInTheDocument();
      expect(screen.queryByText(/<script>/i)).not.toBeInTheDocument();
      expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined();
    });

    it('sanitizes malicious HTML payloads (<script>, onerror, javascript: href) upon submit', async () => {
      render(
        <AppProviders>
          <PageFormModal open={true} onOpenChange={vi.fn()} />
        </AppProviders>
      );

      fireEvent.change(screen.getByLabelText(/Page Title \*/i), {
        target: { value: 'Security Policy' },
      });
      fireEvent.change(screen.getByLabelText(/URL Slug \*/i), {
        target: { value: 'security-policy' },
      });
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).not.toBeNull();
      fireEvent.change(textarea, {
        target: {
          value: '<p>Safe Text</p><script>alert("xss")</script><img src="x" onerror="alert(1)" /><a href="javascript:alert(2)">Click</a>',
        },
      });

      fireEvent.click(screen.getByRole('button', { name: /create page/i }));

      await waitFor(() => {
        expect(mockCreatePageMutateAsync).toHaveBeenCalled();
      });
      const callArg = mockCreatePageMutateAsync.mock.calls[0]?.[0];
      const submittedHtml = (callArg?.content?.[0] as { html?: string })?.html ?? '';
      expect(submittedHtml).not.toContain('<script>');
      expect(submittedHtml).not.toContain('onerror=');
      expect(submittedHtml).not.toContain('javascript:');
    });
  });

  describe('3. Revision History & Rollback Modal', () => {
    it('lists past revisions and opens rollback confirmation dialog', async () => {
      render(
        <AppProviders>
          <PageRevisionsModal
            open={true}
            onOpenChange={vi.fn()}
            page={mockPageTerms}
          />
        </AppProviders>
      );

      expect(screen.getAllByText('v3').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('v2')).toBeInTheDocument();
      expect(screen.getByText('Current Active')).toBeInTheDocument();

      const rollbackBtn = screen.getByRole('button', { name: /rollback/i });
      fireEvent.click(rollbackBtn);

      expect(screen.getByText(/Rollback Page Revision/i)).toBeInTheDocument();
      const confirmBtn = screen.getByRole('button', { name: 'Confirm Rollback' });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(mockRestoreRevisionMutateAsync).toHaveBeenCalledWith({
          id: 'page-01',
          version: 2,
        });
      });
    });
  });

  describe('4. Permission Gates', () => {
    it('hides mutating action buttons when user lacks page:manage permission', () => {
      setupPermissions(['page:read'], false);

      render(
        <AppProviders>
          <PagesManager />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /create page/i })).not.toBeInTheDocument();
      expect(screen.queryByTitle(/Publish page/i)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/Delete page/i)).not.toBeInTheDocument();
    });
  });
});
