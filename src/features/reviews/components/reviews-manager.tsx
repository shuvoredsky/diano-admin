'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTableQueryParams } from '@/lib/crud';
import { useAdminReviewsQuery } from '../hooks/use-reviews-queries';
import { ReviewsFilterBar } from './reviews-filter-bar';
import { ReviewsTable } from './reviews-table';
import { ReviewDetailModal } from './review-detail-modal';
import type { ReviewEntity, ReviewStatusType } from '../types/reviews.types';

export function ReviewsManager() {
  const { searchParams, page, limit, setPage } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') as ReviewStatusType) || undefined;
  const ratingStr = searchParams.get('rating');
  const rating = ratingStr ? Number(ratingStr) : undefined;
  const productId = searchParams.get('productId') || undefined;

  const { data, isLoading } = useAdminReviewsQuery({
    page,
    limit,
    search,
    status,
    rating,
    productId,
  });

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  // Response structure normalization
  const reviews: ReviewEntity[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data as unknown as { items?: ReviewEntity[] })?.items)
      ? ((data as unknown as { items: ReviewEntity[] }).items)
      : [];

  const rawMeta = data?.meta as { totalPages?: number; total?: number } | undefined;
  const totalPages: number = typeof rawMeta?.totalPages === 'number' ? rawMeta.totalPages : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews Moderation"
        description="Moderate customer product ratings, verify purchase feedback, and maintain catalog quality."
      />

      <ReviewsFilterBar />

      <ReviewsTable
        reviews={reviews}
        isLoading={isLoading}
        onSelectReview={(rev) => setSelectedReviewId(rev.id)}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ReviewDetailModal
        reviewId={selectedReviewId}
        isOpen={Boolean(selectedReviewId)}
        onClose={() => setSelectedReviewId(null)}
      />
    </div>
  );
}
