'use client';

import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormField } from '@/components/forms/form-field';
import { RichTextEditor } from '@/components/forms/rich-text-editor';
import { Input } from '@/components/ui/input';
import { useCategoriesQuery } from '@/features/categories';
import type { ProductFormData } from './product-form-types';

export interface ProductBasicSectionProps {
  form: UseFormReturn<ProductFormData>;
}

export function ProductBasicSection({ form }: ProductBasicSectionProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const { data: categories = [] } = useCategoriesQuery();

  const selectedCategoryId = watch('categoryId');
  const shortDescription = watch('shortDescription') || '';
  const description = watch('description') || '';

  // Filter subcategories from selected root category
  const subcategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    const root = categories.find(c => c.id === selectedCategoryId);
    return root?.children || [];
  }, [categories, selectedCategoryId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameVal = e.target.value;
    setValue('name', nameVal, { shouldValidate: true, shouldDirty: true });
    // If slug hasn't been custom modified yet or is empty, auto-generate slug
    const currentSlug = form.getValues('slug');
    if (!currentSlug || currentSlug === slugify(form.getValues('name') || '')) {
      setValue('slug', slugify(nameVal), { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Product Name */}
        <FormField
          label="Product Name"
          htmlFor="name"
          required
          error={errors.name?.message}
          description="A clear, distinctive name (2 to 200 characters)"
        >
          <Input
            id="name"
            placeholder="e.g. Classic Embroidered Cotton Panjabi"
            {...register('name')}
            onChange={handleNameChange}
          />
        </FormField>

        {/* Product Slug */}
        <FormField
          label="URL Slug"
          htmlFor="slug"
          error={errors.slug?.message}
          description="Alphanumeric with hyphens (e.g. classic-embroidered-cotton-panjabi)"
        >
          <div className="flex items-center gap-2">
            <Input
              id="slug"
              placeholder="classic-embroidered-cotton-panjabi"
              {...register('slug')}
            />
            <button
              type="button"
              onClick={() => setValue('slug', slugify(watch('name') || ''), { shouldValidate: true, shouldDirty: true })}
              className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Regenerate slug from name"
            >
              Regenerate
            </button>
          </div>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Category */}
        <FormField
          label="Category"
          htmlFor="categoryId"
          required
          error={errors.categoryId?.message}
        >
          <select
            id="categoryId"
            {...register('categoryId', {
              onChange: () => {
                // Reset subcategory when category changes
                setValue('subcategoryId', '');
              },
            })}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </FormField>

        {/* Subcategory */}
        <FormField
          label="Subcategory (Optional)"
          htmlFor="subcategoryId"
          error={errors.subcategoryId?.message}
        >
          <select
            id="subcategoryId"
            disabled={subcategories.length === 0}
            {...register('subcategoryId')}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="">
              {subcategories.length === 0 ? 'No subcategories available' : 'Select Subcategory'}
            </option>
            {subcategories.map(sub => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </FormField>

        {/* Inventory Type */}
        <FormField
          label="Inventory Type"
          htmlFor="inventoryType"
          error={errors.inventoryType?.message}
        >
          <select
            id="inventoryType"
            {...register('inventoryType')}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="READY_STOCK">Ready Stock</option>
            <option value="PRE_ORDER">Pre-order</option>
            <option value="MADE_TO_ORDER">Made to Order</option>
          </select>
        </FormField>
      </div>

      {/* Short Description */}
      <FormField
        label="Short Description"
        htmlFor="shortDescription"
        error={errors.shortDescription?.message}
        description={`${shortDescription.length}/500 characters. Shown on catalog previews.`}
      >
        <textarea
          id="shortDescription"
          rows={2}
          maxLength={500}
          placeholder="Brief summary for catalog cards and search result snippets..."
          {...register('shortDescription')}
          className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </FormField>

      {/* Full Description with RichTextEditor */}
      <FormField
        label="Full Product Description"
        required
        error={errors.description?.message}
        description="Detailed product narrative, fabric details, sizing notes, care instructions (min 10 characters)."
      >
        <RichTextEditor
          value={description}
          onChange={val => setValue('description', val, { shouldValidate: true, shouldDirty: true })}
          minHeight="220px"
          placeholder="Describe your product thoroughly. Markdown formatting is supported..."
        />
      </FormField>

      {/* Video URL */}
      <FormField
        label="Product Video URL (Optional)"
        htmlFor="videoUrl"
        error={errors.videoUrl?.message}
        description="YouTube or Vimeo preview link"
      >
        <Input
          id="videoUrl"
          placeholder="https://www.youtube.com/watch?v=..."
          {...register('videoUrl')}
        />
      </FormField>

      {/* Checkboxes & Toggles */}
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-muted/20 p-4">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
          <input
            type="checkbox"
            {...register('freeShipping')}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span>Free Shipping</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
          <input
            type="checkbox"
            {...register('specialOffer')}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span>Special Offer Highlight</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
          <input
            type="checkbox"
            {...register('isFeatured')}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span>Feature on Home Showcase</span>
        </label>
      </div>

      {/* Tags */}
      <FormField
        label="Tags (Comma separated)"
        htmlFor="tagsInput"
        description="e.g. Eid 2026, Luxury Cotton, Slim Fit, Panjabi"
      >
        <Input
          id="tagsInput"
          placeholder="Eid Collection, Cotton, Casual"
          {...register('tagsInput')}
        />
      </FormField>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

