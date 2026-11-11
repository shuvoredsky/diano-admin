import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiCard } from '@/components/shared/kpi-card';

describe('KpiCard Component', () => {
  it('renders title, current value and note correctly', () => {
    render(
      <KpiCard
        title="Total Revenue"
        current="150000.00"
        isCurrency
        note="Current month"
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText(/150,000\.00/)).toBeInTheDocument();
    expect(screen.getByText('(Current month)')).toBeInTheDocument();
  });

  it('strictly adheres to rule: null or undefined percent => "—"', () => {
    const { rerender } = render(
      <KpiCard
        title="New Customers"
        current={42}
        percent={null}
      />
    );
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(
      <KpiCard
        title="New Customers"
        current={42}
        percent={undefined}
      />
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders positive percent with plus sign and negative percent formatted', () => {
    const { rerender } = render(
      <KpiCard
        title="Conversion Rate"
        current="3.2%"
        percent={12.4}
        trend="UP"
      />
    );
    expect(screen.getByText('+12.4%')).toBeInTheDocument();

    rerender(
      <KpiCard
        title="Bounce Rate"
        current="45%"
        percent={-5.8}
        trend="DOWN"
      />
    );
    expect(screen.getByText('-5.8%')).toBeInTheDocument();
  });

  it('applies pastel container styles correctly', () => {
    const { container, rerender } = render(
      <KpiCard
        title="Pastel Lavender"
        current={100}
        pastel="lavender"
      />
    );
    expect(container.firstChild).toHaveClass('bg-pastel-lavender/40');

    rerender(
      <KpiCard
        title="Pastel Softgreen"
        current={100}
        pastel="softgreen"
      />
    );
    expect(container.firstChild).toHaveClass('bg-pastel-softgreen/40');
  });
});
