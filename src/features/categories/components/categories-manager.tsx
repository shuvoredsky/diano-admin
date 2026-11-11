'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PermissionGate } from '@/components/shared/permission-gate';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { CategoriesTreeView } from './categories-tree-view';
import { CategoryFormModal } from './category-form-modal';
import { CategoryDeleteDialog } from './category-delete-dialog';
import { SpecTemplateModal } from './spec-template-modal';
import {
  useCategoriesQuery,
  useUpdateCategoryStatusMutation,
  useReorderCategoriesMutation,
} from '../hooks/use-categories-queries';
import type { CategoryItem } from '../types/categories.types';
import { Plus, Search, FolderTree } from 'lucide-react';

export function CategoriesManager() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [parentCategory, setParentCategory] = useState<CategoryItem | null>(null);

  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [specCategory, setSpecCategory] = useState<CategoryItem | null>(null);

  const { data: rawCategories = [], isLoading, isError, error, refetch } = useCategoriesQuery();
  const statusMutation = useUpdateCategoryStatusMutation();
  const reorderMutation = useReorderCategoriesMutation();

  // Helper to build tree from flat list if backend returns flat list
  const categoryTree = useMemo(() => {
    if (!Array.isArray(rawCategories)) return [];

    // If categories already have children structure from backend
    const hasExistingChildren = rawCategories.some((c) => Array.isArray(c.children) && c.children.length > 0);
    if (hasExistingChildren) {
      if (!search.trim()) return rawCategories;
      // Filter search
      const q = search.toLowerCase();
      return rawCategories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }

    // Otherwise reconstruct tree from flat parentId
    const itemMap = new Map<string, CategoryItem>();
    for (const c of rawCategories) {
      itemMap.set(c.id, { ...c, children: [] });
    }

    const roots: CategoryItem[] = [];
    for (const c of rawCategories) {
      const item = itemMap.get(c.id)!;
      if (c.parentId && itemMap.has(c.parentId)) {
        const parent = itemMap.get(c.parentId)!;
        item.depth = (parent.depth || 1) + 1;
        parent.children = parent.children || [];
        parent.children.push(item);
      } else {
        item.depth = 1;
        roots.push(item);
      }
    }

    if (!search.trim()) return roots;
    const q = search.toLowerCase();
    return roots.filter((r) => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q));
  }, [rawCategories, search]);

  const handleCreateRoot = () => {
    setEditingCategory(null);
    setParentCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setParentCategory(null);
    setIsFormOpen(true);
  };

  const handleAddSubcategory = (parent: CategoryItem) => {
    setEditingCategory(null);
    setParentCategory(parent);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (category: CategoryItem) => {
    statusMutation.mutate({
      id: category.id,
      isActive: !category.isActive,
    });
  };

  const handleReorder = (category: CategoryItem, direction: 'up' | 'down') => {
    const delta = direction === 'up' ? -1 : 1;
    const newSortOrder = Math.max(0, (category.sortOrder || 0) + delta);
    reorderMutation.mutate([{ id: category.id, sortOrder: newSortOrder }]);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Categories & Taxonomy"
          description="Hierarchical category tree with max 3-level depth and specification templates."
          className="mb-0"
        />

        <PermissionGate permission="category:create">
          <button
            type="button"
            onClick={handleCreateRoot}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Root Category</span>
          </button>
        </PermissionGate>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-3 bg-card border border-border rounded-2xl p-2.5 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full h-9 rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="text-xs text-muted-foreground font-medium pr-2">
          Total Categories: <span className="font-bold text-foreground">{rawCategories.length}</span>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : isError ? (
        <ErrorState
          title="Failed to load categories"
          message={error instanceof Error ? error.message : 'An error occurred'}
          onRetry={() => refetch()}
        />
      ) : categoryTree.length === 0 ? (
        <EmptyState
          title="No categories found"
          description={search ? 'No categories matched your search criteria.' : 'Create your first root category to begin catalog organization.'}
          icon={<FolderTree className="h-10 w-10 text-muted-foreground/60" />}
          action={
            !search ? (
              <PermissionGate permission="category:create">
                <button
                  type="button"
                  onClick={handleCreateRoot}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-white text-xs font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Category</span>
                </button>
              </PermissionGate>
            ) : undefined
          }
        />
      ) : (
        <CategoriesTreeView
          categories={categoryTree}
          onEdit={handleEdit}
          onAddSubcategory={handleAddSubcategory}
          onDelete={(cat) => setDeletingCategory(cat)}
          onOpenSpecTemplate={(cat) => setSpecCategory(cat)}
          onToggleStatus={handleToggleStatus}
          onReorder={handleReorder}
        />
      )}

      {/* Modals & Dialogs */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={editingCategory}
        parentCategory={parentCategory}
        allCategories={rawCategories}
      />

      <CategoryDeleteDialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        category={deletingCategory}
        allCategories={rawCategories}
      />

      <SpecTemplateModal
        isOpen={Boolean(specCategory)}
        onClose={() => setSpecCategory(null)}
        category={specCategory}
      />
    </div>
  );
}

