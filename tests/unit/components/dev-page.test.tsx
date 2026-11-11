import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import ComponentShowcasePage from '@/app/(dashboard)/admin/dev/components/page';
import { AppProviders } from '@/components/providers/app-providers';

const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound();
    throw new Error('NEXT_NOT_FOUND');
  },
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/dev/components',
  useSearchParams: () => new URLSearchParams(),
}));

describe('/admin/dev/components Production Guard', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('triggers notFound() when NODE_ENV is production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(() => {
      render(
        <AppProviders>
          <ComponentShowcasePage />
        </AppProviders>
      );
    }).toThrow('NEXT_NOT_FOUND');

    expect(mockNotFound).toHaveBeenCalled();
  });

  it('renders showcase page when NODE_ENV is not production', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(
      <AppProviders>
        <ComponentShowcasePage />
      </AppProviders>
    );
    expect(screen.getByText('Component Showcase & Design System')).toBeInTheDocument();
    expect(mockNotFound).not.toHaveBeenCalled();
  });
});
