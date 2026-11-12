'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Globe } from 'lucide-react';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import type { ProductFormData } from './product-form-types';

export interface ProductSeoSectionProps {
  form: UseFormReturn<ProductFormData>;
}

export function ProductSeoSection({ form }: ProductSeoSectionProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const metaTitle = watch('metaTitle') || watch('name') || 'Product Title';
  const metaDescription =
    watch('metaDescription') ||
    watch('shortDescription') ||
    'High quality product available at DIANO with fast delivery across Bangladesh.';
  const slug = watch('slug') || 'product-slug';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Search Engine Optimization</h3>
        <p className="text-xs text-muted-foreground">
          Optimize how this product appears on Google and social search indexes.
        </p>
      </div>

      <div className="space-y-5">
        {/* Meta Title */}
        <FormField
          label="Meta Title"
          htmlFor="metaTitle"
          error={errors.metaTitle?.message}
          description={`${metaTitle.length}/100 characters. Optimal: 50–60 characters.`}
        >
          <Input
            id="metaTitle"
            maxLength={100}
            placeholder="e.g. Classic Embroidered Cotton Panjabi | DIANO"
            {...register('metaTitle')}
          />
        </FormField>

        {/* Meta Description */}
        <FormField
          label="Meta Description"
          htmlFor="metaDescription"
          error={errors.metaDescription?.message}
          description={`${metaDescription.length}/300 characters. Optimal: 120–160 characters.`}
        >
          <textarea
            id="metaDescription"
            rows={3}
            maxLength={300}
            placeholder="Concise overview summarizing key benefits and sizing..."
            {...register('metaDescription')}
            className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </FormField>

        {/* Meta Keywords */}
        <FormField
          label="Meta Keywords"
          htmlFor="metaKeywords"
          error={errors.metaKeywords?.message}
          description="Comma separated search keywords (up to 200 characters)"
        >
          <Input
            id="metaKeywords"
            maxLength={200}
            placeholder="panjabi, cotton panjabi, mens wear, eid collection"
            {...register('metaKeywords')}
          />
        </FormField>
      </div>

      {/* Google SERP Snippet Preview */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
        <div className="mb-3 flex items-center gap-2 border-b border-border pb-2.5">
          <Globe className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-semibold text-foreground">Search Engine Result Preview</h4>
        </div>

        <div className="space-y-1 font-sans">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">diano.com.bd</span>
            <span>&rsaquo;</span>
            <span>products</span>
            <span>&rsaquo;</span>
            <span className="truncate">{slug}</span>
          </div>
          <div className="text-base font-medium text-blue-700 hover:underline dark:text-blue-400 cursor-pointer">
            {metaTitle}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {metaDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

