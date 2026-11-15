'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, MessageSquareQuote, Star, CheckCircle2, AlertTriangle, Trash2, Check, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { DateText } from '@/components/shared/date-text';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/constants/permissions';
import {
  useAdminReviewDetailQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
} from '../hooks/use-reviews-queries';

export interface ReviewDetailModalProps {
  reviewId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function isAllowedCloudinaryUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}

export function ReviewDetailModal({ reviewId, isOpen, onClose }: ReviewDetailModalProps) {
  const { hasPermission } = usePermissions();
  const canModerate = hasPermission(PERMISSIONS.REVIEW_MODERATE);

  const { data: review, isLoading } = useAdminReviewDetailQuery(reviewId || undefined);

  const updateMutation = useUpdateReviewStatusMutation();
  const deleteMutation = useDeleteReviewMutation();

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApprove = async () => {
    if (!review) return;
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        id: review.id,
        input: { status: 'APPROVED' },
      });
      setShowApproveDialog(false);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve review';
      setActionError(msg);
      throw err;
    }
  };

  const handleReject = async () => {
    if (!review) return;
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        id: review.id,
        input: { status: 'REJECTED', reason: rejectReason.trim() || undefined },
      });
      setShowRejectDialog(false);
      setRejectReason('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject review';
      setActionError(msg);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!review) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(review.id);
      setShowDeleteDialog(false);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete review';
      setActionError(msg);
      throw err;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Review Moderation</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {actionError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {actionError}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              <div className="h-16 w-full rounded-xl bg-muted/40 animate-pulse" />
              <div className="h-32 w-full rounded-xl bg-muted/40 animate-pulse" />
            </div>
          ) : review ? (
            <div className="space-y-4 text-xs">
              {/* Product and Status Header */}
              <div className="flex items-start justify-between rounded-xl border border-border bg-muted/20 p-3.5">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Product</span>
                  <span className="font-bold text-foreground text-sm">
                    {review.product?.name || 'Product'}
                  </span>
                  {review.product?.slug && (
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      Slug: {review.product.slug}
                    </span>
                  )}
                </div>
                <StatusBadge status={review.status} />
              </div>

              {/* Customer and Rating Row */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-3">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Reviewer</span>
                  <span className="font-semibold text-foreground">{review.user?.name || 'Customer'}</span>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Verified Purchase
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Rating</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-[11px] font-bold text-foreground">
                      {review.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Content: Safely render escaped text without dangerouslySetInnerHTML */}
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
                {review.title && (
                  <h4 className="font-bold text-foreground text-xs">{review.title}</h4>
                )}
                <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
                  {review.comment}
                </p>
                <div className="pt-2 text-[10px] text-muted-foreground">
                  Submitted: <DateText date={review.createdAt} format="long" />
                </div>
              </div>

              {/* Images if present (whitelisted to Cloudinary CDN only) */}
              {review.images && review.images.length > 0 && (() => {
                const safeImages = review.images.filter((img) => isAllowedCloudinaryUrl(img.url));
                if (safeImages.length === 0) return null;
                return (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Attached Photos ({safeImages.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {safeImages.map((img) => (
                        <a
                          key={img.id}
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity"
                        >
                          <Image
                            src={img.url}
                            alt="Review attachment"
                            width={64}
                            height={64}
                            className="h-16 w-16 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Moderation Details */}
              {review.moderationReason && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs space-y-0.5">
                  <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" /> Moderation Note
                  </div>
                  <p className="text-muted-foreground">{review.moderationReason}</p>
                </div>
              )}

              {/* Actions */}
              {canModerate && (
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive hover:bg-destructive/10 cursor-pointer gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>

                  <div className="flex items-center gap-2">
                    {review.status !== 'REJECTED' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRejectDialog(true)}
                        className="text-amber-600 hover:bg-amber-50 cursor-pointer gap-1"
                      >
                        <Ban className="h-3.5 w-3.5" /> Reject
                      </Button>
                    )}
                    {review.status !== 'APPROVED' && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowApproveDialog(true)}
                        className="gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve Review
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        open={showApproveDialog}
        onOpenChange={(open) => setShowApproveDialog(open)}
        onConfirm={handleApprove}
        title="Approve Review"
        description="Are you sure you want to approve this review? It will be publicly visible on the storefront product page and included in the product's average rating calculation."
        confirmLabel="Approve Review"
        isLoading={updateMutation.isPending}
      />

      {/* Reject Dialog with optional reason */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-3.5">
            <h3 className="text-sm font-bold text-foreground">Reject Review</h3>
            <p className="text-xs text-muted-foreground">
              Provide a moderation explanation for rejecting this review.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Inappropriate language, spam, or off-topic content"
              rows={3}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(false)}
                disabled={updateMutation.isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
                disabled={updateMutation.isPending}
                className="cursor-pointer"
              >
                {updateMutation.isPending ? 'Rejecting...' : 'Reject Review'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => setShowDeleteDialog(open)}
        onConfirm={handleDelete}
        title="Delete Review"
        description="Are you sure you want to permanently delete this review? This action cannot be undone."
        confirmLabel="Delete Review"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
