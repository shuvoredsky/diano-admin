import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import { AppProviders } from '@/components/providers/app-providers';
import { RoutePlaceholder } from '@/components/shared/route-placeholder';

describe('Component & Provider Foundation Smoke Tests', () => {
  it('renders the Phase 1 HomePage inside AppProviders', () => {
    render(
      <AppProviders>
        <HomePage />
      </AppProviders>
    );

    expect(screen.getByRole('heading', { name: 'DIANO Admin Portal' })).toBeInTheDocument();
    expect(screen.getByText(/Phase 1 architectural foundation initialized/i)).toBeInTheDocument();
  });

  it('renders a typed RoutePlaceholder with route metadata', () => {
    render(
      <RoutePlaceholder
        title="Orders"
        routePath="/admin/orders"
        moduleName="features/orders"
        description="Order lifecycle state machine foundation."
      />
    );

    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByText('/admin/orders')).toBeInTheDocument();
  });
});
