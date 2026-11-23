'use client';

import { useState, useMemo } from 'react';
import { useDeleteCategoryMutation } from '../hooks/use-categories-queries';
import type { CategoryItem } from '../types/categories.types';
import { getAllDescendantIds, getCategoryPath } from '../utils/category-tree-utils';
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react';

export interface CategoryDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryItem | null;
  allCategories: CategoryItem[];
}

export function CategoryDeleteDialog({
  isOpen,
  onClose,
  category,
  allCategories,
}: CategoryDeleteDialogProps) {
  const [reassignToId, setReassignToId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useDeleteCategoryMutation();
  const isDeleting = deleteMutation.isPending;

  // Filter out the category being deleted and ALL its descendants
  const validReassignTargets = useMemo(() => {
    if (!category) return [];
    const descendantIds = getAllDescendantIds(category.id, allCategories);
    descendantIds.add(category.id);

    return allCategories
      .filter((c) => !descendantIds.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        path: getCategoryPath(c.id, allCategories) || c.name,
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [category, allCategories]);

  if (!isOpen || !category) return null;

  const hasItems = (category.productCount || 0) > 0 || (category.children && category.children.length > 0);

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteMutation.mutateAsync({
        id: category.id,
        reassignToId: reassignToId || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-destructive/20 bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 text-destructive">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Delete Category</h3>
            <p className="text-xs text-muted-foreground font-mono">{category.name}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Are you sure you want to delete this category? This will perform a safe soft-delete.
        </p>

        {hasItems && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 space-y-2">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
              Notice: This category currently has {category.productCount || 0} product(s) or child categories.
            </p>
            <label className="block text-[11px] font-medium text-amber-900 dark:text-amber-300">
              Reassign products to another category:
            </label>
            <select
              value={reassignToId}
              onChange={(e) => setReassignToId(e.target.value)}
              className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer truncate"
            >
              <option value="">Select target category...</option>
              {validReassignTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.path}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || (hasItems && !reassignToId)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
