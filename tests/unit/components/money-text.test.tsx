import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoneyText, formatBdtAmount } from '@/components/shared/money-text';

describe('formatBdtAmount utility', () => {
  it('formats null, undefined, or empty as 0.00', () => {
    expect(formatBdtAmount(null)).toBe('0.00');
    expect(formatBdtAmount(undefined)).toBe('0.00');
    expect(formatBdtAmount('')).toBe('0.00');
  });

  it('preserves exact decimal precision without float rounding errors', () => {
    expect(formatBdtAmount('12500.50')).toBe('12,500.50');
    expect(formatBdtAmount('99.99')).toBe('99.99');
    expect(formatBdtAmount('1000')).toBe('1,000.00');
  });

  it('handles negative values correctly', () => {
    expect(formatBdtAmount('-500.75')).toBe('-500.75');
    expect(formatBdtAmount(-1200)).toBe('-1,200.00');
  });
});

describe('MoneyText Component', () => {
  it('renders default BDT symbol ৳ with formatted amount', () => {
    render(<MoneyText amount="4500.00" />);
    expect(screen.getByText('৳')).toBeInTheDocument();
    expect(screen.getByText('4,500.00')).toBeInTheDocument();
  });

  it('allows hiding the symbol or using custom symbol', () => {
    const { rerender } = render(<MoneyText amount="100.00" showSymbol={false} />);
    expect(screen.queryByText('৳')).not.toBeInTheDocument();
    expect(screen.getByText('100.00')).toBeInTheDocument();

    rerender(<MoneyText amount="100.00" symbol="$" />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('applies colored styling for negative and zero amounts', () => {
    const { container, rerender } = render(<MoneyText amount="-250.00" colored />);
    expect(container.firstChild).toHaveClass('text-destructive');

    rerender(<MoneyText amount="0" colored />);
    expect(container.firstChild).toHaveClass('text-muted-foreground');
  });
});
