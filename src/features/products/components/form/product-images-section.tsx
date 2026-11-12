'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AlertCircle, Trash2, ArrowUp, ArrowDown, UploadCloud } from 'lucide-react';
import { ImageSlotUploader } from '@/components/forms/image-slot-uploader';
import {
  useDeleteProductImageMutation,
  useReorderProductImagesMutation,
  useUploadProductImageMutation,
} from '../../hooks/use-products-queries';
import type { AdminProductDto } from '../../types/products.types';

export interface ProductImagesSectionProps {
  product?: AdminProductDto;
  isCreateMode?: boolean;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function ProductImagesSection({
  product,
  isCreateMode = false,
}: ProductImagesSectionProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadMutation = useUploadProductImageMutation(product?.id || '');
  const deleteMutation = useDeleteProductImageMutation(product?.id || '');
  const reorderMutation = useReorderProductImagesMutation(product?.id || '');

  if (isCreateMode || !product) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">Upload Images After Creating</h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
          Once you save this product, you can upload and arrange thumbnail, back-view, and gallery media slots.
        </p>
      </div>
    );
  }

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMessage(`Invalid file format "${file.name}". Supported: WebP, JPEG, PNG.`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File "${file.name}" exceeds the 5MB upload limit.`);
      return false;
    }
    return true;
  };

  const handleUpload = async (slot: 'THUMBNAIL' | 'BACKVIEW' | 'GALLERY', file: File) => {
    if (!validateFile(file)) return;
    try {
      await uploadMutation.mutateAsync({ slot, file });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload image');
    }
  };

  const handleDelete = async (imageId: string) => {
    setErrorMessage(null);
    try {
      await deleteMutation.mutateAsync(imageId);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const thumbnailImage = product.images.find(img => img.slot === 'THUMBNAIL' || img.isPrimary);
  const backviewImage = product.images.find(img => img.slot === 'BACKVIEW');
  const galleryImages = product.images
    .filter(img => img.slot === 'GALLERY')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const moveGalleryImage = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;

    const reordered = [...galleryImages];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((img, i) => ({ id: img.id, sortOrder: i + 1 }));
    try {
      await reorderMutation.mutateAsync(payload);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reorder images');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Media Slots</h3>
        <p className="text-xs text-muted-foreground">
          Upload and manage catalog storefront images. Maximum 5MB per file (WebP, JPEG, PNG).
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Two Slots: Thumbnail and Backview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Thumbnail Slot */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Thumbnail (Front View) <span className="text-destructive">*</span>
            </span>
            <span className="text-[11px] text-muted-foreground">Primary catalog card</span>
          </div>

          <ImageSlotUploader
            slot="thumbnail"
            currentUrl={thumbnailImage?.url}
            disabled={uploadMutation.isPending}
            onFileSelect={file => handleUpload('THUMBNAIL', file)}
            onRemove={() => thumbnailImage && handleDelete(thumbnailImage.id)}
          />
        </div>

        {/* Backview Slot */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Back View (Hover View)
            </span>
            <span className="text-[11px] text-muted-foreground">Shown on product hover</span>
          </div>

          <ImageSlotUploader
            slot="backview"
            currentUrl={backviewImage?.url}
            disabled={uploadMutation.isPending}
            onFileSelect={file => handleUpload('BACKVIEW', file)}
            onRemove={() => backviewImage && handleDelete(backviewImage.id)}
          />
        </div>
      </div>

      {/* Gallery Images */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-foreground">
              Gallery Images ({galleryImages.length}/6)
            </span>
            <p className="text-[11px] text-muted-foreground">
              Detail shots, model poses, and fabric close-ups
            </p>
          </div>
          {galleryImages.length < 6 && (
            <label className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
              <span>+ Add Gallery Image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploadMutation.isPending}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload('GALLERY', file);
                }}
              />
            </label>
          )}
        </div>

        {galleryImages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            No gallery images uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {galleryImages.map((img, idx) => (
              <div
                key={img.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xs"
              >
                <div className="relative aspect-square w-full bg-muted">
                  <Image
                    src={img.url}
                    alt={img.altText || `Gallery image ${idx + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-border bg-card p-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0 || reorderMutation.isPending}
                      onClick={() => moveGalleryImage(idx, 'up')}
                      className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                      title="Move Left"
                      aria-label="Move image earlier"
                    >
                      <ArrowUp className="h-3 w-3 rotate-[-90deg]" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === galleryImages.length - 1 || reorderMutation.isPending}
                      onClick={() => moveGalleryImage(idx, 'down')}
                      className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                      title="Move Right"
                      aria-label="Move image later"
                    >
                      <ArrowDown className="h-3 w-3 rotate-[-90deg]" />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(img.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive cursor-pointer"
                    title="Delete image"
                    aria-label={`Delete gallery image ${idx + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

