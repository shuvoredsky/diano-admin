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
import { ApiClientError } from '@/lib/api/api-error';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '../../hooks/use-products-queries';
import {
  uploadProductThumbnail,
  uploadProductBackview,
  uploadProductGalleryImage,
} from '../../api/products.api';
import type { AdminProductDto, CreateProductPayload, UpdateProductPayload } from '../../types/products.types';
import type { ProductFormData } from './product-form-types';
import { ProductBasicSection } from './product-basic-section';
import { ProductPricingSection } from './product-pricing-section';
import { ProductVariantsSection } from './product-variants-section';
import { ProductSpecsSection } from './product-specs-section';
import { ProductImagesSection, type PendingImagesState } from './product-images-section';
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
  const [pendingImages, setPendingImages] = useState<PendingImagesState>({ gallery: [] });

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
    shouldUnregister: false,
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

    // 1. Publish verification guard for ACTIVE status
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

    // 2. Required fields validation guards for catalog products
    if (!data.name || data.name.trim().length < 2) {
      setError('name', { type: 'manual', message: 'Product name must be at least 2 characters' });
      setPublishError('Product name must be at least 2 characters');
      setActiveTab('basic');
      return;
    }

    if (!data.categoryId) {
      setError('categoryId', { type: 'manual', message: 'Category is required' });
      setPublishError('Please select a Category in Basic Info');
      setActiveTab('basic');
      return;
    }

    if (!data.description || data.description.trim().length < 10) {
      setError('description', { type: 'manual', message: 'Description must be at least 10 characters' });
      setPublishError('Full Product Description must be at least 10 characters');
      setActiveTab('basic');
      return;
    }

    // Pricing & Variants validation: Product MRP or Variant compareAtPrice is required when variant price is not explicitly specified
    const parsedMrp =
      data.mrp !== undefined && data.mrp !== null && !isNaN(Number(data.mrp)) && Number(data.mrp) > 0
        ? Number(data.mrp)
        : null;
    const hasVariantPrices = data.variants?.every(
      v => v.price !== undefined && v.price !== null && !isNaN(Number(v.price)) && Number(v.price) > 0
    );
    if (!parsedMrp && !hasVariantPrices) {
      setError('mrp', {
        type: 'manual',
        message: 'Base MRP or Variant price is required',
      });
      setPublishError('Please specify Base MRP in "Pricing & Discounts" or set individual prices for all variants');
      setActiveTab('pricing');
      return;
    }

    if (!data.variants || data.variants.length === 0) {
      setError('variants', { type: 'manual', message: 'At least one variant is required' });
      setPublishError('At least one product variant is required');
      setActiveTab('variants');
      return;
    }

    const hasInvalidVariant = data.variants.some(v => !v.name?.trim() || !v.sku?.trim());
    if (hasInvalidVariant) {
      setPublishError('All variants must have a name and a valid SKU in "Variants" tab');
      setActiveTab('variants');
      return;
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
          mrp: parsedMrp,
          discountType: data.discountType,
          discountValue:
            data.discountValue !== undefined && data.discountValue !== null && !isNaN(Number(data.discountValue))
              ? Number(data.discountValue)
              : null,
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
          variants: data.variants.map(v => {
            const variantPrice =
              v.price !== undefined && v.price !== null && !isNaN(Number(v.price)) && Number(v.price) > 0
                ? Number(v.price)
                : undefined;
            const variantCompareAt =
              v.compareAtPrice !== undefined && v.compareAtPrice !== null && !isNaN(Number(v.compareAtPrice)) && Number(v.compareAtPrice) > 0
                ? Number(v.compareAtPrice)
                : (parsedMrp ?? null);
            return {
              name: v.name.trim(),
              sku: v.sku.trim().toUpperCase(),
              barcode: v.barcode?.trim() || null,
              price: variantPrice,
              compareAtPrice: variantCompareAt,
              costPrice:
                v.costPrice !== undefined && v.costPrice !== null && !isNaN(Number(v.costPrice))
                  ? Number(v.costPrice)
                  : null,
              isActive: v.isActive,
            };
          }),
        };

        const created = await createMutation.mutateAsync(payload);

        // Upload any media selected during creation
        const uploadTasks: Promise<unknown>[] = [];
        if (pendingImages.thumbnail) {
          uploadTasks.push(uploadProductThumbnail(created.id, pendingImages.thumbnail));
        }
        if (pendingImages.backview) {
          uploadTasks.push(uploadProductBackview(created.id, pendingImages.backview));
        }
        for (const item of pendingImages.gallery) {
          uploadTasks.push(uploadProductGalleryImage(created.id, item.file));
        }

        if (uploadTasks.length > 0) {
          await Promise.allSettled(uploadTasks);
        }

        router.push('/admin/products');
      } else if (initialProduct) {
        const payload: UpdateProductPayload = {
          name: data.name.trim(),
          slug: data.slug.trim() || undefined,
          description: data.description.trim(),
          shortDescription: data.shortDescription?.trim() || null,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId || null,
          videoUrl: data.videoUrl?.trim() || null,
          mrp: parsedMrp,
          discountType: data.discountType,
          discountValue:
            data.discountValue !== undefined && data.discountValue !== null && !isNaN(Number(data.discountValue))
              ? Number(data.discountValue)
              : null,
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
      let detailedMsg = generalMsg;
      if (err instanceof ApiClientError && Array.isArray(err.errors) && err.errors.length > 0) {
        const details = (err.errors as { field?: string; message?: string }[])
          .map(e => e.message)
          .filter(Boolean);
        if (details.length > 0) {
          detailedMsg = `${generalMsg}: ${details.join(' • ')}`;
        }

        // Auto-switch to the first tab that has an error
        const errorFields = (err.errors as { field?: string; path?: string }[])
          .map(e => e.field || e.path || '')
          .filter(Boolean);

        if (errorFields.some(f => ['name', 'slug', 'categoryId', 'subcategoryId', 'description', 'shortDescription', 'videoUrl', 'inventoryType'].includes(f))) {
          setActiveTab('basic');
        } else if (errorFields.some(f => ['mrp', 'discountType', 'discountValue'].includes(f))) {
          setActiveTab('pricing');
        } else if (errorFields.some(f => f.startsWith('variants'))) {
          setActiveTab('variants');
        } else if (errorFields.some(f => f.startsWith('specifications'))) {
          setActiveTab('specs');
        } else if (errorFields.some(f => f.startsWith('seo') || ['metaTitle', 'metaDescription', 'metaKeywords'].includes(f))) {
          setActiveTab('seo');
        }
      }
      setPublishError(detailedMsg || (err instanceof Error ? err.message : 'An error occurred while saving'));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  const formErrors = form.formState.errors;
  const tabErrors: Record<TabType, boolean> = {
    basic: Boolean(
      formErrors.name ||
        formErrors.slug ||
        formErrors.categoryId ||
        formErrors.subcategoryId ||
        formErrors.description ||
        formErrors.shortDescription ||
        formErrors.videoUrl ||
        formErrors.inventoryType
    ),
    pricing: Boolean(formErrors.mrp || formErrors.discountType || formErrors.discountValue),
    variants: Boolean(formErrors.variants),
    specs: Boolean(formErrors.specifications),
    media: false,
    seo: Boolean(formErrors.metaTitle || formErrors.metaDescription || formErrors.metaKeywords),
  };

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
              <Button type="button" variant="outline" className="flex items-center gap-1.5 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </Link>

            <PermissionGate permissions={[isCreateMode ? 'product:create' : 'product:update']}>
              <Button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 cursor-pointer"
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
            className="h-8 rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
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
          const hasError = tabErrors[tab.id];
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
              {hasError && (
                <span
                  className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-pulse"
                  title="Contains required fields or validation errors"
                >
                  !
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels: keep mounted with CSS display to preserve form input states and DOM refs across tab switches */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
        <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
          <ProductBasicSection form={form} />
        </div>
        <div className={activeTab === 'pricing' ? 'block' : 'hidden'}>
          <ProductPricingSection form={form} />
        </div>
        <div className={activeTab === 'variants' ? 'block' : 'hidden'}>
          <ProductVariantsSection form={form} />
        </div>
        <div className={activeTab === 'specs' ? 'block' : 'hidden'}>
          <ProductSpecsSection form={form} />
        </div>
        <div className={activeTab === 'media' ? 'block' : 'hidden'}>
          <ProductImagesSection
            product={initialProduct}
            isCreateMode={isCreateMode}
            pendingImages={pendingImages}
            onPendingImagesChange={setPendingImages}
          />
        </div>
        <div className={activeTab === 'seo' ? 'block' : 'hidden'}>
          <ProductSeoSection form={form} />
        </div>
      </div>
    </form>
  );
}

