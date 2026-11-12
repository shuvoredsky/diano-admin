'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Layers } from 'lucide-react';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { useCategoryProductFormSchemaQuery } from '@/features/categories';
import type { ProductFormData } from './product-form-types';

export interface ProductSpecsSectionProps {
  form: UseFormReturn<ProductFormData>;
}

export function ProductSpecsSection({ form }: ProductSpecsSectionProps) {
  const {
    watch,
    setValue,
  } = form;

  const categoryId = watch('categoryId');
  const specifications = watch('specifications') || {};

  const {
    data: schemaData,
    isLoading,
  } = useCategoryProductFormSchemaQuery(categoryId);

  const fields = schemaData?.fields || [];

  const handleFieldChange = (key: string, value: unknown) => {
    setValue(`specifications.${key}`, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  if (!categoryId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <Layers className="h-8 w-8 text-muted-foreground mb-2" />
        <h4 className="text-sm font-semibold text-foreground">Select a Category First</h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Dynamic specification templates (fabric, fit, care, dimensions) will load automatically based on your chosen category.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-10 bg-muted animate-pulse rounded-lg" />
          <div className="h-10 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground">
          No dynamic specifications defined for this category. You can configure specification templates in the Categories manager.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {schemaData?.categoryName || 'Category'} Specifications
        </h3>
        <p className="text-xs text-muted-foreground">
          Fill in attribute specifications tailored to this product category.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields.map(field => {
          const val = specifications[field.key];

          return (
            <FormField
              key={field.key}
              label={field.label}
              htmlFor={`spec-${field.key}`}
              required={field.required}
            >
              {field.type === 'select' ? (
                <select
                  id={`spec-${field.key}`}
                  value={(val as string) || ''}
                  onChange={e => handleFieldChange(field.key, e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === 'number' ? (
                <Input
                  id={`spec-${field.key}`}
                  type="number"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={val !== undefined && val !== null ? String(val) : ''}
                  onChange={e =>
                    handleFieldChange(
                      field.key,
                      e.target.value === '' ? undefined : Number(e.target.value)
                    )
                  }
                />
              ) : (
                <Input
                  id={`spec-${field.key}`}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={(val as string) || ''}
                  onChange={e => handleFieldChange(field.key, e.target.value)}
                />
              )}
            </FormField>
          );
        })}
      </div>
    </div>
  );
}

