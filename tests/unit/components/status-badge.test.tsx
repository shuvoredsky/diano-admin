import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from '@/components/shared/status-badge';

describe('StatusBadge Component', () => {
  it('automatically maps known status to corresponding variant style', () => {
    const { container, rerender } = render(<StatusBadge status="DELIVERED" />);
    expect(screen.getByText('delivered')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-pastel-softgreen');

    rerender(<StatusBadge status="PENDING" />);
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-pastel-peach');

    rerender(<StatusBadge status="CANCELLED" />);
    expect(screen.getByText('cancelled')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-destructive/15');
  });

  it('renders custom label when provided', () => {
    render(<StatusBadge status="PROCESSING" label="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders pulsating dot when pulse prop is true', () => {
    const { container } = render(<StatusBadge status="ACTIVE" pulse />);
    const pingDot = container.querySelector('.animate-ping');
    expect(pingDot).toBeInTheDocument();
  });

  it('supports explicit variant override', () => {
    const { container } = render(<StatusBadge status="CUSTOM" variant="purple" />);
    expect(container.firstChild).toHaveClass('bg-pastel-lavender');
  });
});
