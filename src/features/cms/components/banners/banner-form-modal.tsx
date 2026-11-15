'use client';

import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BANNER_PLACEMENTS } from '../../constants/banners.constants';
import type { BannerEntity, CreateBannerInput, UpdateBannerInput, BannerPlacement } from '../../types/banners.types';
import { useCreateBannerMutation, useUpdateBannerMutation } from '../../hooks/use-banners-queries';
import { useDirtyFormGuard } from '@/lib/crud/use-dirty-form-guard';
import { isSafeUrl } from '@/lib/validations/link-safety';

export interface BannerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bannerToEdit?: BannerEntity | null;
}

export function BannerFormModal({ open, onOpenChange, bannerToEdit }: BannerFormModalProps) {
  const [placement, setPlacement] = useState<BannerPlacement>('HOME_HERO');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [desktopImage, setDesktopImage] = useState('');
  const [mobileImage, setMobileImage] = useState('');
  const [altText, setAltText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [apiError, setApiError] = useState<string | null>(null);

  const createMutation = useCreateBannerMutation();
  const updateMutation = useUpdateBannerMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const isDirty = Boolean(title || desktopImage || subtitle || linkUrl);
  useDirtyFormGuard(isDirty && open && !isPending);

  useEffect(() => {
    if (bannerToEdit) {
      setPlacement(bannerToEdit.placement);
      setTitle(bannerToEdit.title);
      setSubtitle(bannerToEdit.subtitle || '');
      setDesktopImage(bannerToEdit.desktopImage);
      setMobileImage(bannerToEdit.mobileImage || '');
      setAltText(bannerToEdit.altText || '');
      setLinkUrl(bannerToEdit.linkUrl || '');
      setCtaText(bannerToEdit.ctaText || '');
      setStartsAt(bannerToEdit.startsAt ? bannerToEdit.startsAt.slice(0, 16) : '');
      setEndsAt(bannerToEdit.endsAt ? bannerToEdit.endsAt.slice(0, 16) : '');
      setIsActive(bannerToEdit.isActive);
      setSortOrder(String(bannerToEdit.sortOrder ?? 0));
    } else {
      setPlacement('HOME_HERO');
      setTitle('');
      setSubtitle('');
      setDesktopImage('');
      setMobileImage('');
      setAltText('');
      setLinkUrl('');
      setCtaText('');
      setStartsAt('');
      setEndsAt('');
      setIsActive(true);
      setSortOrder('0');
    }
    setApiError(null);
  }, [bannerToEdit, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (title.trim().length < 2) {
      setApiError('Title must be at least 2 characters');
      return;
    }
    if (!desktopImage.trim()) {
      setApiError('Desktop image URL is required');
      return;
    }

    if (linkUrl.trim() && !isSafeUrl(linkUrl.trim())) {
      setApiError('Destination link must be an http/https URL or internal relative path starting with /');
      return;
    }

    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setApiError('End date must be strictly after start date');
      return;
    }

    try {
      const payload: CreateBannerInput | UpdateBannerInput = {
        placement,
        title: title.trim(),
        subtitle: subtitle.trim() ? subtitle.trim() : null,
        desktopImage: desktopImage.trim(),
        mobileImage: mobileImage.trim() ? mobileImage.trim() : null,
        altText: altText.trim() ? altText.trim() : null,
        linkUrl: linkUrl.trim() ? linkUrl.trim() : null,
        ctaText: ctaText.trim() ? ctaText.trim() : null,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        isActive,
        sortOrder: parseInt(sortOrder, 10) || 0,
      };

      if (bannerToEdit) {
        await updateMutation.mutateAsync({ id: bannerToEdit.id, input: payload });
      } else {
        await createMutation.mutateAsync(payload as CreateBannerInput);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      let msg = 'Failed to save banner';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setApiError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {bannerToEdit ? 'Edit Promotional Banner' : 'Create New Banner'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure storefront placement, visual assets, and display duration.
            </p>
          </div>
        </div>

        {apiError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="placement" className="text-xs">Placement</Label>
              <select
                id="placement"
                value={placement}
                onChange={(e) => setPlacement(e.target.value as BannerPlacement)}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                {BANNER_PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sortOrder" className="text-xs">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs">Banner Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Eid Silk Panjabi Collection 2026"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subtitle" className="text-xs">Subtitle / Caption (Optional)</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Up to 35% Off Premium Heritage Wear"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="desktopImage" className="text-xs">Desktop Image URL *</Label>
              <Input
                id="desktopImage"
                value={desktopImage}
                onChange={(e) => setDesktopImage(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobileImage" className="text-xs">Mobile Image URL (Optional)</Label>
              <Input
                id="mobileImage"
                value={mobileImage}
                onChange={(e) => setMobileImage(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="linkUrl" className="text-xs">Destination Link (URL or relative path)</Label>
              <Input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/products?category=panjabi or https://..."
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ctaText" className="text-xs">CTA Button Text</Label>
              <Input
                id="ctaText"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. Shop Now"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="altText" className="text-xs">Accessibility Alt Text</Label>
            <Input
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Festive Panjabi promotional banner"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startsAt" className="text-xs">Start Schedule (Dhaka Local)</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endsAt" className="text-xs">End Schedule (Dhaka Local)</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="isActive" className="text-xs font-normal cursor-pointer">
              Publish banner immediately (Active)
            </Label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Saving...' : bannerToEdit ? 'Save Changes' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
