import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppProviders } from '@/components/providers/app-providers';
import { CategoriesTreeView } from '@/features/categories/components/categories-tree-view';
import { CategoryDeleteDialog } from '@/features/categories/components/category-delete-dialog';
import { SpecTemplateModal } from '@/features/categories/components/spec-template-modal';
import * as authPermissionsHook from '@/features/auth/hooks/use-auth-permissions';
import type { CategoryItem } from '@/features/categories/types/categories.types';

const mockCategories: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Men',
    slug: 'men',
    depth: 1,
    isActive: true,
    isFeatured: true,
    sortOrder: 0,
    productCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    children: [
      {
        id: 'cat-2',
        name: 'Panjabi',
        slug: 'panjabi',
        parentId: 'cat-1',
        depth: 2,
        isActive: true,
        isFeatured: false,
        sortOrder: 0,
        productCount: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: [
          {
            id: 'cat-3',
            name: 'Semilong Panjabi',
            slug: 'semilong-panjabi',
            parentId: 'cat-2',
            depth: 3,
            isActive: true,
            isFeatured: false,
            sortOrder: 0,
            productCount: 4,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            children: [
              {
                id: 'cat-4',
                name: 'Cotton Blend',
                slug: 'cotton-blend',
                parentId: 'cat-3',
                depth: 4,
                isActive: true,
                isFeatured: false,
                sortOrder: 0,
                productCount: 2,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                children: [
                  {
                    id: 'cat-5',
                    name: 'Hand Embroidered',
                    slug: 'hand-embroidered',
                    parentId: 'cat-4',
                    depth: 5,
                    isActive: true,
                    isFeatured: false,
                    sortOrder: 0,
                    productCount: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Categories Management (Unlimited Depth)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Categories Tree View & Depth Rules', () => {
    it('renders deep nested hierarchy (5+ levels) when expanded with depth badges', () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['category:read', 'category:create', 'category:update', 'category:delete'],
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
          <CategoriesTreeView
            categories={mockCategories}
            onEdit={vi.fn()}
            onAddSubcategory={vi.fn()}
            onDelete={vi.fn()}
            onOpenSpecTemplate={vi.fn()}
            onToggleStatus={vi.fn()}
            onReorder={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.getByText('Men')).toBeInTheDocument();
      expect(screen.getByText('Level 1')).toBeInTheDocument();

      // Click "Expand All" to reveal all 5 levels
      const expandAllBtn = screen.getByRole('button', { name: /Expand All/i });
      fireEvent.click(expandAllBtn);

      expect(screen.getByText('Panjabi')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('Semilong Panjabi')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
      expect(screen.getByText('Cotton Blend')).toBeInTheDocument();
      expect(screen.getByText('Level 4')).toBeInTheDocument();
      expect(screen.getByText('Hand Embroidered')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });

    it('allows adding subcategories at deep levels without hardcoded level 3 limit', () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['category:read', 'category:create', 'category:update', 'category:delete'],
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
          <CategoriesTreeView
            categories={mockCategories}
            onEdit={vi.fn()}
            onAddSubcategory={vi.fn()}
            onDelete={vi.fn()}
            onOpenSpecTemplate={vi.fn()}
            onToggleStatus={vi.fn()}
            onReorder={vi.fn()}
          />
        </AppProviders>
      );

      // Expand all to see all nodes
      const expandAllBtn = screen.getByRole('button', { name: /Expand All/i });
      fireEvent.click(expandAllBtn);

      // "Add Sub" button is visible for every level (all 5 nodes have add sub button)
      const addSubButtons = screen.getAllByTitle('Add Subcategory');
      expect(addSubButtons.length).toBe(5);
    });

    it('hides modification actions for users lacking category permissions', () => {
      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue({
        user: undefined,
        permissions: ['category:read'],
        roles: ['staff'],
        isSuperAdmin: false,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: (perm) => perm === 'category:read',
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
      });

      render(
        <AppProviders>
          <CategoriesTreeView
            categories={mockCategories}
            onEdit={vi.fn()}
            onAddSubcategory={vi.fn()}
            onDelete={vi.fn()}
            onOpenSpecTemplate={vi.fn()}
            onToggleStatus={vi.fn()}
            onReorder={vi.fn()}
          />
        </AppProviders>
      );

      expect(screen.queryByTitle('Add Subcategory')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Edit Category')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Delete Category')).not.toBeInTheDocument();
    });
  });

  describe('Category Delete Dialog with Safety Reassignment', () => {
    it('prompts for reassignToId when category has products and prevents deletion without target', () => {
      render(
        <AppProviders>
          <CategoryDeleteDialog
            isOpen={true}
            onClose={vi.fn()}
            category={mockCategories[0] || null}
            allCategories={mockCategories}
          />
        </AppProviders>
      );

      expect(screen.getByText(/Delete Category/i)).toBeInTheDocument();
      expect(screen.getByText(/currently has 15 product\(s\)/i)).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', { name: /Confirm Delete/i });
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Specification Template Modal', () => {
    it('allows adding and updating specification attributes', async () => {
      render(
        <AppProviders>
          <SpecTemplateModal
            isOpen={true}
            onClose={vi.fn()}
            category={mockCategories[0] || null}
          />
        </AppProviders>
      );

      expect(screen.getByText(/Specification Template: Men/i)).toBeInTheDocument();

      const addFieldBtn = screen.getByRole('button', { name: /Add Specification Field/i });
      fireEvent.click(addFieldBtn);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('e.g. Fabric Material')).toBeInTheDocument();
      });
    });
  });
});
