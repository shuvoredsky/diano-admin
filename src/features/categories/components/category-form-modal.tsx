'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mapBackendValidationErrors } from '@/lib/crud';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../hooks/use-categories-queries';
import type { CategoryItem } from '../types/categories.types';
import { getAllDescendantIds, getCategoryPath, buildCategoryTreeOptions } from '../utils/category-tree-utils';
import { X, Loader2, AlertCircle, GitFork } from 'lucide-react';

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be alphanumeric with hyphens')
    .max(120)
    .optional()
    .or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  parentId: z.string().nullable().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryItem | null;
  parentCategory?: CategoryItem | null;
  allCategories: CategoryItem[];
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  parentCategory,
  allCategories,
}: CategoryFormModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: null,
      isFeatured: false,
      isActive: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      if (category) {
        reset({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          parentId: category.parentId || null,
          isFeatured: category.isFeatured,
          isActive: category.isActive,
          sortOrder: category.sortOrder || 0,
        });
      } else if (parentCategory) {
        reset({
          name: '',
          slug: '',
          description: '',
          parentId: parentCategory.id,
          isFeatured: false,
          isActive: true,
          sortOrder: 0,
        });
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          parentId: null,
          isFeatured: false,
          isActive: true,
          sortOrder: 0,
        });
      }
    }
  }, [isOpen, category, parentCategory, reset]);

  // Current category breadcrumb path in edit mode
  const currentPath = useMemo(() => {
    if (!category) return null;
    return getCategoryPath(category.id, allCategories);
  }, [category, allCategories]);

  // Build parent options preventing cycle: category itself + all its descendants are disabled
  const parentOptions = useMemo(() => {
    const disabledIds = new Set<string>();
    if (category) {
      disabledIds.add(category.id);
      const descendants = getAllDescendantIds(category.id, allCategories);
      for (const dId of descendants) {
        disabledIds.add(dId);
      }
    }
    return buildCategoryTreeOptions(allCategories, disabledIds);
  }, [category, allCategories]);

  if (!isOpen) return null;

  const onSubmit = async (values: CategoryFormValues) => {
    setServerError(null);
    try {
      const payload = {
        name: values.name.trim(),
        slug: values.slug?.trim() || undefined,
        description: values.description?.trim() || undefined,
        parentId: values.parentId || null,
        isFeatured: values.isFeatured,
        isActive: values.isActive,
        sortOrder: values.sortOrder,
      };

      if (category) {
        await updateMutation.mutateAsync({ id: category.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: unknown) {
      const msg = mapBackendValidationErrors(err, setError);
      setServerError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {category ? 'Edit Category' : parentCategory ? `Add Subcategory to "${parentCategory.name}"` : 'New Root Category'}
            </h2>
            {currentPath && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                <GitFork className="h-3 w-3 text-primary" />
                <span>Path: <strong className="text-foreground">{currentPath}</strong></span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {serverError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Category Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Panjabi, Footwear"
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Slug (Optional)
              </label>
              <input
                type="text"
                {...register('slug')}
                placeholder="auto-generated if empty"
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.slug && <p className="text-[11px] text-destructive mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Parent Category
              </label>
              <select
                {...register('parentId')}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer truncate"
              >
                <option value="">None (Root Category — Level 1)</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} disabled={opt.disabled}>
                    {opt.path} {opt.disabled ? '(Self / Descendant)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Short description for storefront display..."
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.description && (
              <p className="text-[11px] text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Active on Storefront</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Featured Category</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-9 px-4 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || (!isDirty && Boolean(category))}
              className="inline-flex items-center gap-1.5 h-9 px-5 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{category ? 'Save Changes' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
