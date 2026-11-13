'use client';

import { X, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/feedback/skeletons';
import { ErrorState } from '@/components/feedback/error-state';
import { useFraudReviewDetailQuery } from '../hooks/use-fraud-queries';
import { FraudReviewSummarySection } from './fraud-review-summary-section';
import { FraudReviewRulesSection } from './fraud-review-rules-section';
import { FraudReviewActionsSection } from './fraud-review-actions-section';

export interface FraudReviewDetailModalProps {
  reviewId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FraudReviewDetailModal({
  reviewId,
  isOpen,
  onClose,
}: FraudReviewDetailModalProps) {
  const {
    data: review,
    isLoading,
    isError,
    error,
    refetch,
  } = useFraudReviewDetailQuery(isOpen ? reviewId || undefined : undefined);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fraud-review-title"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="fraud-review-title"
                className="text-base font-bold text-foreground"
              >
                Fraud Risk Review
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                {reviewId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to load fraud assessment"
              message={
                error instanceof Error ? error.message : 'An unexpected error occurred.'
              }
              onRetry={() => refetch()}
            />
          ) : review ? (
            <div className="space-y-6">
              <FraudReviewSummarySection review={review} />
              <FraudReviewRulesSection triggeredRules={review.triggeredRules} />
              <FraudReviewActionsSection review={review} onSuccess={() => refetch()} />
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border px-6 py-3 bg-muted/20 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
