'use client';

import { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/forms/rich-text-editor';
import { PAGE_TYPES, SYSTEM_PAGE_SLUGS } from '../../constants/pages.constants';
import type { PageEntity, CreatePageInput, UpdatePageInput, PageType, PageStatus } from '../../types/pages.types';
import { useCreatePageMutation, useUpdatePageMutation } from '../../hooks/use-pages-queries';
import { useDirtyFormGuard } from '@/lib/crud/use-dirty-form-guard';
import { sanitizeHtml } from '@/lib/validations/html-sanitizer';

export interface PageFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageToEdit?: PageEntity | null;
}

export function PageFormModal({ open, onOpenChange, pageToEdit }: PageFormModalProps) {
  const isEditing = Boolean(pageToEdit);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<PageType>('CUSTOM');
  const [status, setStatus] = useState<PageStatus>('DRAFT');
  const [htmlContent, setHtmlContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  const createMutation = useCreatePageMutation();
  const updateMutation = useUpdatePageMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const isDirty = Boolean(title || slug || htmlContent || metaTitle);
  useDirtyFormGuard(isDirty && open && !isPending);

  useEffect(() => {
    if (pageToEdit) {
      setTitle(pageToEdit.title);
      setSlug(pageToEdit.slug);
      setType(pageToEdit.type);
      setStatus(pageToEdit.status);
      setMetaTitle(pageToEdit.metaTitle || '');
      setMetaDescription(pageToEdit.metaDescription || '');
      setOgImage(pageToEdit.ogImage || '');

      // Extract rich text from blocks
      const richBlock = pageToEdit.content?.find((b) => b.type === 'richText');
      setHtmlContent(richBlock && 'html' in richBlock ? String(richBlock.html) : '');
    } else {
      setTitle('');
      setSlug('');
      setType('CUSTOM');
      setStatus('DRAFT');
      setHtmlContent('');
      setMetaTitle('');
      setMetaDescription('');
      setOgImage('');
    }
    setApiError(null);
  }, [pageToEdit, open]);

  if (!open) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      // Auto slugify on creation if slug hasn't been manually diverged
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  const isLegalSystemSlug = (SYSTEM_PAGE_SLUGS as readonly string[]).includes(slug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (title.trim().length < 2) {
      setApiError('Page title must be at least 2 characters');
      return;
    }

    const cleanSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setApiError('Slug must be lowercase alphanumeric and kebab-case (e.g. privacy-policy)');
      return;
    }

    const cleanHtml = sanitizeHtml(htmlContent.trim());
    const contentBlocks = cleanHtml
      ? [{ type: 'richText' as const, html: cleanHtml }]
      : [];

    try {
      if (isEditing && pageToEdit) {
        const updatePayload: UpdatePageInput = {
          title: title.trim(),
          type,
          content: contentBlocks,
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
          ogImage: ogImage.trim() || undefined,
          status,
        };
        await updateMutation.mutateAsync({ id: pageToEdit.id, input: updatePayload });
      } else {
        const createPayload: CreatePageInput = {
          slug: cleanSlug,
          title: title.trim(),
          type,
          content: contentBlocks,
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
          ogImage: ogImage.trim() || undefined,
          status,
        };
        await createMutation.mutateAsync(createPayload);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      let msg = 'Failed to save page';
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
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isEditing ? `Edit Page: ${pageToEdit?.title}` : 'Create New Informational / Legal Page'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure URL routing, markdown/rich content, and search engine metadata.
            </p>
          </div>
        </div>

        {/* Legal Advisory Banner for Policy Slugs */}
        {isLegalSystemSlug && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-muted-foreground">
            <Scale className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-600">Legal Compliance Notice</span>
              <p className="text-[11px] leading-relaxed">
                Mandatory legal documents (Privacy Policy, Terms of Service, Return & Refund Policy) must be reviewed by legal counsel representing DIANO in Bangladesh. Avoid publishing unverified placeholder copy.
              </p>
            </div>
          </div>
        )}

        {apiError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="page-title" className="text-xs">Page Title *</Label>
              <Input
                id="page-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Return & Exchange Policy"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="page-slug" className="text-xs">
                URL Slug {isEditing ? '(Immutable)' : '*'}
              </Label>
              <Input
                id="page-slug"
                value={slug}
                disabled={isEditing}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="e.g. return-policy"
                className={`h-9 text-xs font-mono ${isEditing ? 'bg-muted opacity-80 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="page-type" className="text-xs">Page Classification</Label>
              <select
                id="page-type"
                value={type}
                onChange={(e) => setType(e.target.value as PageType)}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                {PAGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="page-status" className="text-xs">Publication Status</Label>
              <select
                id="page-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PageStatus)}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="DRAFT">Draft (Unpublished)</option>
                <option value="PUBLISHED">Published (Visible to Storefront)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Rich Content Editor */}
          <div className="space-y-1.5">
            <Label className="text-xs">Page Content (Rich Text / Markdown)</Label>
            <RichTextEditor
              value={htmlContent}
              onChange={setHtmlContent}
              placeholder="Write page content, clauses, headings, and lists here..."
              minHeight="220px"
              disabled={isPending}
            />
          </div>

          {/* SEO Metadata Accordion/Fields */}
          <div className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Search Engine & Social Preview Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="meta-title" className="text-xs">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Custom browser title"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="og-image" className="text-xs">OG Share Image URL</Label>
                <Input
                  id="og-image"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="meta-desc" className="text-xs">Meta Description</Label>
                <Input
                  id="meta-desc"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief summary for Google search indexing..."
                  className="h-8 text-xs"
                />
              </div>
            </div>
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
              {isPending ? 'Saving...' : isEditing ? 'Save Revisions' : 'Create Page'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
