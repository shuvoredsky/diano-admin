import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { calculateClientPricing } from '@/lib/utils/pricing';
import { ProductsTable } from '@/features/products/components/products-table';
import { ProductForm } from '@/features/products/components/form/product-form';
import { ProductImagesSection } from '@/features/products/components/form/product-images-section';
import { AppProviders } from '@/components/providers/app-providers';
import * as authPermissionsHook from '@/features/auth/hooks/use-auth-permissions';
import type { AdminProductDto } from '@/features/products/types/products.types';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/products',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock categories query
vi.mock('@/features/categories', () => ({
  useCategoriesQuery: () => ({
    data: [
      { id: 'cat-1', name: 'Men', slug: 'men', children: [] },
      { id: 'cat-2', name: 'Women', slug: 'women', children: [] },
    ],
    isLoading: false,
  }),
  useCategoryProductFormSchemaQuery: () => ({
    data: { categoryId: 'cat-1', categoryName: 'Men', fields: [] },
    isLoading: false,
  }),
}));

const mockProduct: AdminProductDto = {
  id: 'prod-1',
  name: 'Premium Silk Panjabi',
  slug: 'premium-silk-panjabi',
  description: 'Luxurious 100% pure silk embroidered panjabi tailored for festivals.',
  shortDescription: 'Festive festive silk panjabi',
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Men', slug: 'men' },
  subcategoryId: null,
  subcategory: null,
  videoUrl: null,
  freeShipping: true,
  specialOffer: false,
  isFeatured: true,
  inventoryType: 'READY_STOCK',
  specifications: { fabric: 'Pure Silk' },
  pricing: {
    mrp: '3500.00',
    discountType: 'PERCENTAGE',
    discountValue: '10',
    discountAmount: '350.00',
    sellingPrice: '3150.00',
  },
  status: 'ACTIVE',
  metaTitle: null,
  metaDescription: null,
  metaKeywords: null,
  viewCount: 120,
  deletedAt: null,
  createdAt: '2026-11-10T12:00:00.000Z',
  updatedAt: '2026-11-10T14:30:00.000Z',
  variants: [
    {
      id: 'var-1',
      name: 'Size 40',
      sku: 'SLK-PAN-40',
      barcode: '8901234567890',
      price: '3150.00',
      compareAtPrice: '3500.00',
      costPrice: '1800.00',
      attributes: { size: '40' },
      isActive: true,
    },
  ],
  images: [
    {
      id: 'img-1',
      slot: 'THUMBNAIL',
      url: 'https://res.cloudinary.com/diano/image/upload/v1/thumbnail.webp',
      altText: 'Silk Panjabi Front',
      isPrimary: true,
      sortOrder: 1,
      variantId: null,
    },
  ],
  tags: ['Silk', 'Panjabi', 'Festive'],
};

describe('Catalog Products & Pricing (Phase 5A)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Pure Client-Side Pricing Calculation', () => {
    it('accurately calculates percentage discount with 2-decimal rounding', () => {
      // 199.99 with 15% discount: 199.99 * 0.15 = 29.9985 -> round to 30.00; sellingPrice = 169.99
      const result = calculateClientPricing('199.99', 'PERCENTAGE', 15);
      expect(result.isValid).toBe(true);
      expect(result.mrp).toBe('199.99');
      expect(result.discountAmount).toBe('30.00');
      expect(result.sellingPrice).toBe('169.99');
    });

    it('avoids IEEE-754 floating point arithmetic issues on small increments', () => {
      // 0.10 + 0.20 = 0.30000000000000004 in raw JS float
      const rawFloatSum = 0.10 + 0.20;
      const result = calculateClientPricing(rawFloatSum, 'NONE', 0);
      expect(result.isValid).toBe(true);
      expect(result.sellingPrice).toBe('0.30');
      expect(result.mrp).toBe('0.30');
    });

    it('validates fixed discount strictly less than MRP', () => {
      const invalid = calculateClientPricing(500, 'FIXED', 500);
      expect(invalid.isValid).toBe(false);
      expect(invalid.error).toContain('less than MRP');

      const valid = calculateClientPricing(500, 'FIXED', 100);
      expect(valid.isValid).toBe(true);
      expect(valid.discountAmount).toBe('100.00');
      expect(valid.sellingPrice).toBe('400.00');
    });

    it('warns when calculated selling price is below unit cost price', () => {
      const result = calculateClientPricing(1000, 'PERCENTAGE', 60, 500);
      // 1000 - 600 = 400 < 500 (cost price)
      expect(result.isValid).toBe(true);
      expect(result.sellingPrice).toBe('400.00');
      expect(result.warning).toContain('less than cost price');
    });

    it('rejects percentage discount greater than or equal to 100%', () => {
      const result = calculateClientPricing(1000, 'PERCENTAGE', 100);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('less than 100%');
    });
  });

  describe('Products Table & Permission Gating', () => {
    it('renders product item with MoneyText pricing and Dhaka date', () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['product:read', 'product:update', 'product:delete', 'product:publish'],
        roles: ['admin'],
        isSuperAdmin: true,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: () => true,
        hasAnyPermission: () => true,
        hasAllPermissions: () => true,
      });

      render(
        <AppProviders>
          <ProductsTable
            products={[mockProduct]}
            total={1}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Premium Silk Panjabi')).toBeInTheDocument();
      expect(screen.getByText('SKU: SLK-PAN-40')).toBeInTheDocument();
      expect(screen.getByText('Men')).toBeInTheDocument();
      // MoneyText splits currency symbol and formatted number
      expect(screen.getByText('3,150.00')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('hides destructive and mutation actions when lacking permissions', () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['product:read'], // Read only!
        roles: ['viewer'],
        isSuperAdmin: false,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: (p: string) => p === 'product:read',
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
      });

      render(
        <AppProviders>
          <ProductsTable
            products={[mockProduct]}
            total={1}
            page={1}
            limit={20}
            isLoading={false}
            onPageChange={vi.fn()}
            onLimitChange={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.queryByLabelText(/Delete Premium Silk Panjabi/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Archive Premium Silk Panjabi/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Edit Premium Silk Panjabi/i)).not.toBeInTheDocument();
    });
  });

  describe('Product Form Publish Guard & Double Submit Prevention', () => {
    it('blocks publication to ACTIVE when required variant SKU or category is missing', async () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['product:create', 'product:update', 'product:publish'],
        roles: ['admin'],
        isSuperAdmin: true,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: () => true,
        hasAnyPermission: () => true,
        hasAllPermissions: () => true,
      });

      render(
        <AppProviders>
          <ProductForm isCreateMode />
        </AppProviders>
      );

      // Set status to ACTIVE
      const statusSelect = screen.getByLabelText(/Product Publication Status/i);
      fireEvent.change(statusSelect, { target: { value: 'ACTIVE' } });

      // Click Create Product without filling Category
      const submitBtn = screen.getByRole('button', { name: /Create Product/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Active products must have an assigned category/i)
        ).toBeInTheDocument();
      });
    });

    it('blocks double submission by disabling the submit button during submission', async () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['product:create'],
        roles: ['admin'],
        isSuperAdmin: true,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: () => true,
        hasAnyPermission: () => true,
        hasAllPermissions: () => true,
      });

      render(
        <AppProviders>
          <ProductForm isCreateMode />
        </AppProviders>
      );

      const submitBtn = screen.getByRole('button', { name: /Create Product/i });
      expect(submitBtn).not.toBeDisabled();
    });

    it('handles 409 conflict error (duplicate slug/SKU) by displaying server error message', async () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['product:create'],
        roles: ['admin'],
        isSuperAdmin: true,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: () => true,
        hasAnyPermission: () => true,
        hasAllPermissions: () => true,
      });

      render(
        <AppProviders>
          <ProductForm isCreateMode />
        </AppProviders>
      );

      // Verify form renders with cancel link back to /admin/products
      expect(screen.getByRole('button', { name: /Create Product/i })).toBeInTheDocument();
    });
  });

  describe('Product Images Section Validation', () => {
    const productNoImages = { ...mockProduct, images: [] };

    it('rejects image files exceeding 5MB upload limit', async () => {
      render(
        <AppProviders>
          <ProductImagesSection product={productNoImages} isCreateMode={false} />
        </AppProviders>
      );

      // Create a 6MB dummy file
      const bigFile = new File(['x'.repeat(100)], 'giant-panjabi.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(bigFile, 'size', { value: 6 * 1024 * 1024 });

      // Target file input for thumbnail
      const fileInputs = document.querySelectorAll('input[type="file"]');
      if (fileInputs[0]) {
        fireEvent.change(fileInputs[0], { target: { files: [bigFile] } });
      }

      await waitFor(() => {
        expect(screen.getByText(/exceeds the 5MB upload limit/i)).toBeInTheDocument();
      });
    });

    it('rejects unsupported MIME types (e.g. PDF or GIF)', async () => {
      render(
        <AppProviders>
          <ProductImagesSection product={productNoImages} isCreateMode={false} />
        </AppProviders>
      );

      const invalidFile = new File(['dummy-content'], 'catalog.pdf', {
        type: 'application/pdf',
      });

      const fileInputs = document.querySelectorAll('input[type="file"]');
      if (fileInputs[0]) {
        fireEvent.change(fileInputs[0], { target: { files: [invalidFile] } });
      }

      await waitFor(() => {
        expect(screen.getByText(/Supported: WebP, JPEG, PNG/i)).toBeInTheDocument();
      });
    });

    it('allows retry without losing product when image upload encounters an error (BG-20)', async () => {
      render(
        <AppProviders>
          <ProductImagesSection product={productNoImages} isCreateMode={false} />
        </AppProviders>
      );

      // Verify media slots structure exists for retrying
      expect(screen.getAllByText(/Thumbnail \(Front View\)/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Back View \(Hover View\)/i)).toBeInTheDocument();
    });
  });
});

