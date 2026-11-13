import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';

describe('ConfirmDialog Regression Tests', () => {
  it('renders rich ReactNode description cleanly without Radix DOM nesting warnings', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Confirm Cancellation"
        description={
          <div data-testid="rich-description">
            <p className="text-xs">Reason required for audit trail:</p>
            <textarea placeholder="Enter note" />
          </div>
        }
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText('Confirm Cancellation')).toBeInTheDocument();
    expect(screen.getByTestId('rich-description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter note')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when onConfirm succeeds', async () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        onConfirm={onConfirm}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('keeps dialog open (does not call onOpenChange(false)) when onConfirm rejects or throws', async () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn().mockRejectedValue(new Error('Validation failed'));

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Cancel Order"
        description="Cancellation requires a note"
        onConfirm={onConfirm}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    // onOpenChange must NOT have been called to close the dialog
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('disables buttons and shows processing label when isLoading is true', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Loading State"
        description="Wait while operation processes"
        isLoading={true}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole('button', { name: /processing\.\.\./i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });
});
