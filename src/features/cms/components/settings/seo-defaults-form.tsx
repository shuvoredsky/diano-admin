'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { SeoDefaultsSettings } from '../../types/settings.types';
import { useSeoDefaultsQuery, useUpdateSettingsMutation } from '../../hooks/use-settings-queries';
import { useDirtyFormGuard } from '@/lib/crud/use-dirty-form-guard';
import { usePermissions } from '@/hooks/use-permissions';

export function SeoDefaultsForm() {
  const { data: seo, isLoading } = useSeoDefaultsQuery();
  const updateMutation = useUpdateSettingsMutation<SeoDefaultsSettings>('seo_defaults');

  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('settings:update');

  const [titleTemplate, setTitleTemplate] = useState('%s | DIANO Premium Heritage');
  const [description, setDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (seo) {
      setTitleTemplate(seo.titleTemplate || '%s | DIANO Premium Heritage');
      setDescription(seo.description || '');
      setOgImage(seo.ogImage || '');
    }
  }, [seo]);

  const isDirty = Boolean(
    seo &&
      (titleTemplate !== (seo.titleTemplate || '%s | DIANO Premium Heritage') ||
        description !== (seo.description || '') ||
        ogImage !== (seo.ogImage || ''))
  );
  useDirtyFormGuard(isDirty && !updateMutation.isPending);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (titleTemplate.trim().length < 3) {
      setStatusMsg({ type: 'error', text: 'Title template must be at least 3 characters.' });
      return;
    }
    if (description.trim().length < 10) {
      setStatusMsg({ type: 'error', text: 'Default meta description must be at least 10 characters.' });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        titleTemplate: titleTemplate.trim(),
        description: description.trim(),
        ogImage: ogImage.trim() || undefined,
      });
      setStatusMsg({ type: 'success', text: 'SEO and OpenGraph defaults saved.' });
    } catch (err: unknown) {
      let msg = 'Failed to save SEO settings';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  if (isLoading) {
    return <div className="h-64 rounded-2xl border border-border bg-card p-6 animate-pulse" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Search Engine Optimization & OpenGraph Previews
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titleTemplate" className="text-xs">Browser Title Template *</Label>
            <Input
              id="titleTemplate"
              value={titleTemplate}
              onChange={(e) => setTitleTemplate(e.target.value)}
              disabled={!canUpdate}
              placeholder="%s | DIANO Premium Heritage"
              className="h-9 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground">%s is replaced dynamically by individual product or page titles.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">Global Meta Description *</Label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canUpdate}
              placeholder="DIANO is Bangladesh's premier luxury apparel house offering handcrafted silk panjabis, festive wear, and sustainable artisanal fashion."
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            <p className="text-[11px] text-muted-foreground">Displayed in Google search snippets when a page-specific meta description is absent.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ogImage" className="text-xs">Default OpenGraph Social Share Image URL</Label>
            <Input
              id="ogImage"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              disabled={!canUpdate}
              placeholder="https://res.cloudinary.com/diano/image/upload/og-default.jpg"
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">Appears when links to your store are shared on Facebook, WhatsApp, LinkedIn, or Twitter.</p>
          </div>
        </div>
      </div>

      {canUpdate && (
        <div className="flex items-center justify-end">
          <Button type="submit" size="sm" disabled={updateMutation.isPending} className="cursor-pointer">
            {updateMutation.isPending ? 'Saving...' : 'Save SEO Configuration'}
          </Button>
        </div>
      )}
    </form>
  );
}
