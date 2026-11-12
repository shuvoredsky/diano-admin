'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  FileText,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Search,
  AlertCircle,
  Save,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { PermissionGate } from '@/components/shared/permission-gate';
import { mapBackendValidationErrors, useDirtyFormGuard } from '@/lib/crud';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '../../hooks/use-products-queries';
import type { AdminProductDto, CreateProductPayload, UpdateProductPayload } from '../../types/products.types';
import type { ProductFormData } from './product-form-types';
import { ProductBasicSection } from './product-basic-section';
import { ProductPricingSection } from './product-pricing-section';
import { ProductVariantsSection } from './product-variants-section';
import { ProductSpecsSection } from './product-specs-section';
import { ProductImagesSection } from './product-images-section';
import { ProductSeoSection } from './product-seo-section';

export interface ProductFormProps {
  initialProduct?: AdminProductDto;
  isCreateMode?: boolean;
}

type TabType = 'basic' | 'pricing' | 'variants' | 'specs' | 'media' | 'seo';

export function ProductForm({
  initialProduct,
  isCreateMode = false,
}: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [publishError, setPublishError] = useState<string | null>(null);

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation(initialProduct?.id || '');

  // Default values mapping
  const defaultValues: ProductFormData = {
    name: initialProduct?.name || '',
    slug: initialProduct?.slug || '',
    description: initialProduct?.description || '',
    shortDescription: initialProduct?.shortDescription || '',
    categoryId: initialProduct?.categoryId || '',
    subcategoryId: initialProduct?.subcategoryId || '',
    videoUrl: initialProduct?.videoUrl || '',
    inventoryType: initialProduct?.inventoryType || 'READY_STOCK',
    freeShipping: initialProduct?.freeShipping ?? false,
    specialOffer: initialProduct?.specialOffer ?? false,
    isFeatured: initialProduct?.isFeatured ?? false,
    status: initialProduct?.status || 'DRAFT',
    tags: initialProduct?.tags || [],
    tagsInput: initialProduct?.tags ? initialProduct.tags.join(', ') : '',
    mrp: initialProduct?.pricing?.mrp ? Number(initialProduct.pricing.mrp) : undefined,
    discountType: initialProduct?.pricing?.discountType || 'NONE',
    discountValue: initialProduct?.pricing?.discountValue
      ? Number(initialProduct.pricing.discountValue)
      : undefined,
    metaTitle: initialProduct?.metaTitle || '',
    metaDescription: initialProduct?.metaDescription || '',
    metaKeywords: initialProduct?.metaKeywords || '',
    specifications: initialProduct?.specifications || {},
    variants: initialProduct?.variants?.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      barcode: v.barcode || '',
      price: v.price ? Number(v.price) : undefined,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      costPrice: v.costPrice ? Number(v.costPrice) : null,
      isActive: v.isActive,
      attributes: v.attributes,
    })) || [
      {
        name: 'Default',
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        isActive: true,
      },
    ],
  };

  const form = useForm<ProductFormData>({
    defaultValues,
    mode: 'onTouched',
  });

  const {
    handleSubmit,
    register,
    watch,
    setError,
    formState: { isDirty, isSubmitting },
  } = form;

  // Protect against navigating away with unsaved edits
  useDirtyFormGuard(isDirty && !isSubmitting);

  const status = watch('status');

  const onSubmit = async (data: ProductFormData) => {
    setPublishError(null);

    // Parse tags from comma separated input
    const parsedTags = data.tagsInput
      ? data.tagsInput
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      : [];

    // Publish verification guard
    if (data.status === 'ACTIVE') {
      if (!data.categoryId) {
        setPublishError('Active products must have an assigned category');
        setActiveTab('basic');
        return;
      }
      if (!data.variants || data.variants.length === 0) {
        setPublishError('Active products must have at least one variant');
        setActiveTab('variants');
        return;
      }
      const hasActiveVariant = data.variants.some(v => v.isActive && v.sku.trim());
      if (!hasActiveVariant) {
        setPublishError('Active products require at least one active variant with a valid SKU');
        setActiveTab('variants');
        return;
      }
      if (!isCreateMode && initialProduct) {
        const hasThumbnail = initialProduct.images.some(
          img => img.slot === 'THUMBNAIL' || img.isPrimary
        );
        if (!hasThumbnail) {
          setPublishError('Active products must have a thumbnail image uploaded');
          setActiveTab('media');
          return;
        }
      }
    }

    try {
      if (isCreateMode) {
        const payload: CreateProductPayload = {
          name: data.name.trim(),
          slug: data.slug.trim() || undefined,
          description: data.description.trim(),
          shortDescription: data.shortDescription?.trim() || null,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId || null,
          videoUrl: data.videoUrl?.trim() || null,
          mrp: data.mrp || null,
          discountType: data.discountType,
          discountValue: data.discountValue || null,
          freeShipping: data.freeShipping,
          specialOffer: data.specialOffer,
          isFeatured: data.isFeatured,
          inventoryType: data.inventoryType,
          specifications: data.specifications,
          seo: {
            metaTitle: data.metaTitle?.trim() || null,
            metaDescription: data.metaDescription?.trim() || null,
            metaKeywords: data.metaKeywords?.trim() || null,
          },
          status: data.status,
          tags: parsedTags,
          variants: data.variants.map(v => ({
            name: v.name.trim(),
            sku: v.sku.trim().toUpperCase(),
            barcode: v.barcode?.trim() || null,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            costPrice: v.costPrice,
            isActive: v.isActive,
          })),
        };

        const created = await createMutation.mutateAsync(payload);
        router.push(`/admin/products/${created.id}`);
      } else if (initialProduct) {
        const payload: UpdateProductPayload = {
          name: data.name.trim(),
          slug: data.slug.trim() || undefined,
          description: data.description.trim(),
          shortDescription: data.shortDescription?.trim() || null,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId || null,
          videoUrl: data.videoUrl?.trim() || null,
          mrp: data.mrp || null,
          discountType: data.discountType,
          discountValue: data.discountValue || null,
          freeShipping: data.freeShipping,
          specialOffer: data.specialOffer,
          isFeatured: data.isFeatured,
          inventoryType: data.inventoryType,
          specifications: data.specifications,
          seo: {
            metaTitle: data.metaTitle?.trim() || null,
            metaDescription: data.metaDescription?.trim() || null,
            metaKeywords: data.metaKeywords?.trim() || null,
          },
          status: data.status,
          tags: parsedTags,
        };

        await updateMutation.mutateAsync(payload);
        router.push('/admin/products');
      }
    } catch (err: unknown) {
      const generalMsg = mapBackendValidationErrors(err, setError);
      setPublishError(generalMsg || (err instanceof Error ? err.message : 'An error occurred while saving'));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  const tabs: { id: TabType; label: string; icon: typeof FileText }[] = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'pricing', label: 'Pricing & Discounts', icon: DollarSign },
    { id: 'variants', label: 'Variants', icon: Layers },
    { id: 'specs', label: 'Specifications', icon: Layers },
    { id: 'media', label: 'Media Slots', icon: ImageIcon },
    { id: 'seo', label: 'SEO & Search', icon: Search },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <PageHeader
        title={isCreateMode ? 'Add New Product' : `Edit Product: ${initialProduct?.name}`}
        description={
          isCreateMode
            ? 'Set up product information, initial variants, and pricing'
            : 'Update catalog details, variants, media, and promotional pricing'
        }
        actions={
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <Button type="button" variant="outline" className="flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </Link>

            <PermissionGate permissions={[isCreateMode ? 'product:create' : 'product:update']}>
              <Button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                <span>
                  {isPending
                    ? 'Saving...'
                    : isCreateMode
                    ? 'Create Product'
                    : 'Save Changes'}
                </span>
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {publishError && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{publishError}</span>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground">Publication Status:</span>
          <select
            {...register('status')}
            aria-label="Product Publication Status"
            className="h-8 rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="DRAFT">DRAFT (Unpublished)</option>
            <option value="ACTIVE">ACTIVE (Visible in Storefront)</option>
            <option value="ARCHIVED">ARCHIVED (Discontinued)</option>
          </select>
        </div>

        <div className="text-[11px] text-muted-foreground">
          {status === 'ACTIVE'
            ? '✓ Visible in storefront searches and category listings'
            : status === 'ARCHIVED'
            ? '⚠️ Hidden from customer catalog; historical records preserved'
            : '📝 Draft mode: accessible to admins only'}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-mint text-primary-deep dark:bg-mint/20 dark:text-primary shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
        {activeTab === 'basic' && <ProductBasicSection form={form} />}
        {activeTab === 'pricing' && <ProductPricingSection form={form} />}
        {activeTab === 'variants' && <ProductVariantsSection form={form} />}
        {activeTab === 'specs' && <ProductSpecsSection form={form} />}
        {activeTab === 'media' && (
          <ProductImagesSection
            product={initialProduct}
            isCreateMode={isCreateMode}
          />
        )}
        {activeTab === 'seo' && <ProductSeoSection form={form} />}
      </div>
    </form>
  );
}

