'use client';

import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const isDestructive = variant === 'destructive';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isDestructive
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary'
              }`}
            >
              {isDestructive ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Dialog.Title className="text-base font-bold text-foreground tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description asChild className="text-sm text-muted-foreground">
                <div>{description}</div>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" size="sm" disabled={isLoading} className="rounded-lg">
                {cancelLabel}
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant={isDestructive ? 'destructive' : 'default'}
              size="sm"
              disabled={isLoading}
              onClick={async () => {
                try {
                  await onConfirm();
                  onOpenChange(false);
                } catch {
                  // Keep dialog open if onConfirm throws validation/network error
                }
              }}
              className="rounded-lg"
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
