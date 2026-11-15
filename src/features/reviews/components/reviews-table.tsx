'use client';

import { useState } from 'react';
import { Star, CheckCircle2, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { EmptyState } from '@/components/feedback/empty-state';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/constants/permissions';
import { useDeleteReviewMutation } from '../hooks/use-reviews-queries';
import type { ReviewEntity } from '../types/reviews.types';

export interface ReviewsTableProps {
  reviews: ReviewEntity[];
  isLoading: boolean;
  onSelectReview: (review: ReviewEntity) => void;
}

export function ReviewsTable({ reviews, isLoading, onSelectReview }: ReviewsTableProps) {
  const { hasPermission } = usePermissions();
  const canModerate = hasPermission(PERMISSIONS.REVIEW_MODERATE);

  const deleteMutation = useDeleteReviewMutation();
  const [reviewToDelete, setReviewToDelete] = useState<ReviewEntity | null>(null);

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    await deleteMutation.mutateAsync(reviewToDelete.id);
    setReviewToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
        <EmptyState
          title="No reviews found"
          description="Customer product reviews will appear here once submitted and verified."
        />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-foreground">{rev.user?.name || 'Customer'}</div>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 max-w-[180px]">
                    <span className="font-medium text-foreground truncate block">
                      {rev.product?.name || 'Product'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-[11px] font-bold text-foreground">
                        {rev.rating}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-[260px]">
                    {rev.title && (
                      <span className="font-semibold text-foreground block truncate">
                        {rev.title}
                      </span>
                    )}
                    <span className="text-muted-foreground line-clamp-2">
                      {rev.comment}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={rev.status} />
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                    <DateText date={rev.createdAt} format="short" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectReview(rev)}
                        title="View and moderate review"
                        className="h-8 gap-1 text-xs cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        Moderate
                      </Button>
                      {canModerate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReviewToDelete(rev)}
                          title="Delete review"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(reviewToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setReviewToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        description="Are you sure you want to permanently delete this customer review? This action cannot be undone."
        confirmLabel="Delete Review"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
